#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

#[repr(C, align(4096))]
struct VmcbPage([u8; 4096]);

static mut HSAVE_AREA: VmcbPage = VmcbPage([0; 4096]);
static mut VMCB_AREA: VmcbPage = VmcbPage([0; 4096]);
static mut GUEST_STACK: [u8; 4096] = [0; 4096];

// Minimal valid GDT for 64-bit mode
#[repr(C, align(16))]
struct Gdt {
    null: u64,
    code: u64,
    data: u64,
}

static GDT: Gdt = Gdt {
    null: 0,
    // Code segment: Base=0, Limit=0xFFFFF, L=1, P=1, S=1, Type=0xA
    code: 0x00AF_9A00_0000_FFFF,
    // Data segment: Base=0, Limit=0xFFFFF, P=1, S=1, Type=0x2
    data: 0x00CF_9200_0000_FFFF,
};

#[no_mangle]
pub extern "C" fn _start() -> ! {
    unsafe { 
        outb(0xE9, b'!'); 
        serial_init();
    }

    serial_println("\n================================================");
    serial_println("  BIZRA-ZERO-HV :: PHASE 2 :: RING-1 GOVERNOR   ");
    serial_println("================================================");

    unsafe {
        // GATE 1: CPUID
        let mut ecx_out: u32;
        asm!(
            "push rbx", "cpuid", "pop rbx",
            inlateout("eax") 0x80000001u32 => _,
            out("ecx") ecx_out, out("edx") _,
        );
        if (ecx_out >> 2) & 1 != 1 {
            serial_println("NO SVM");
            loop { asm!("hlt"); }
        }
        serial_println("::GATE1:: SVM=1");

        // GATE 2: SVME
        let mut lo: u32;
        let mut hi: u32;
        asm!("rdmsr", in("ecx") 0xC0000080u32, out("eax") lo, out("edx") hi);
        lo |= 1 << 12;
        asm!("wrmsr", in("ecx") 0xC0000080u32, in("eax") lo, in("edx") hi);
        serial_println("::GATE2:: SVME=1");

        // GATE 3: HSAVE
        let hsave_pa = core::ptr::addr_of!(HSAVE_AREA) as u64;
        asm!("wrmsr", in("ecx") 0xC0010117u32, 
             in("eax") (hsave_pa as u32), in("edx") ((hsave_pa >> 32) as u32));
        serial_println("::GATE3:: HSAVE set");

        // GATE 4: VMCB
        let vmcb = core::ptr::addr_of_mut!(VMCB_AREA) as *mut u8;
        for i in 0..4096 { core::ptr::write_volatile(vmcb.add(i), 0); }

        // CONTROL AREA
        // 0x000: CR read intercept = 0
        // 0x004: CR write intercept = 0
        // 0x008: DR read intercept = 0
        // 0x00C: Intercept misc 1 - bit 18 = CPUID
        w32(vmcb, 0x00C, 1 << 18);
        
        // 0x010: Intercept misc 2 - bit 0 = VMRUN
        w32(vmcb, 0x010, 1 << 0);
        
        // 0x058: Guest ASID (non-zero required)
        w32(vmcb, 0x058, 1);
        
        // 0x05C: TLB control (0 = do nothing)
        w32(vmcb, 0x05C, 0);
        
        // 0x090: NP_ENABLE = 1 (nested paging)
        w64(vmcb, 0x090, 1);
        
        // 0x0B0: nCR3 (nested page table root)
        w64(vmcb, 0x0B0, read_cr3());

        // STATE SAVE AREA (0x400+)
        // GDT pointer
        let gdt_ptr = core::ptr::addr_of!(GDT) as u64;
        let gdt_limit = (core::mem::size_of::<Gdt>() - 1) as u32;
        
        // ES (0x400): selector=0x10, attrib=0x93, limit=0xFFFF, base=0
        w16(vmcb, 0x400, 0x10);
        w16(vmcb, 0x402, 0x0093);
        w32(vmcb, 0x404, 0xFFFFFFFF);
        w64(vmcb, 0x408, 0);
        
        // CS (0x410): selector=0x08, attrib=0x29B (L=1,P=1,S=1,exec)
        w16(vmcb, 0x410, 0x08);
        w16(vmcb, 0x412, 0x029B);  // L=1 (bit 9), not 0x209B
        w32(vmcb, 0x414, 0xFFFFFFFF);
        w64(vmcb, 0x418, 0);
        
        // SS (0x420)
        w16(vmcb, 0x420, 0x10);
        w16(vmcb, 0x422, 0x0093);
        w32(vmcb, 0x424, 0xFFFFFFFF);
        w64(vmcb, 0x428, 0);
        
        // DS (0x430)
        w16(vmcb, 0x430, 0x10);
        w16(vmcb, 0x432, 0x0093);
        w32(vmcb, 0x434, 0xFFFFFFFF);
        w64(vmcb, 0x438, 0);
        
        // FS (0x440)
        w16(vmcb, 0x440, 0x10);
        w16(vmcb, 0x442, 0x0093);
        w32(vmcb, 0x444, 0xFFFFFFFF);
        w64(vmcb, 0x448, 0);
        
        // GS (0x450)
        w16(vmcb, 0x450, 0x10);
        w16(vmcb, 0x452, 0x0093);
        w32(vmcb, 0x454, 0xFFFFFFFF);
        w64(vmcb, 0x458, 0);
        
        // GDTR (0x460): limit, base
        w16(vmcb, 0x460, 0);          // selector (unused)
        w16(vmcb, 0x462, 0);          // attrib (unused)
        w32(vmcb, 0x464, gdt_limit);  // limit
        w64(vmcb, 0x468, gdt_ptr);    // base
        
        // LDTR (0x470): null
        w16(vmcb, 0x470, 0);
        w16(vmcb, 0x472, 0x0082);     // LDT type
        w32(vmcb, 0x474, 0);
        w64(vmcb, 0x478, 0);
        
        // IDTR (0x480)
        w16(vmcb, 0x480, 0);
        w16(vmcb, 0x482, 0);
        w32(vmcb, 0x484, 0xFFFF);
        w64(vmcb, 0x488, 0);
        
        // TR (0x490): must be valid for 64-bit
        w16(vmcb, 0x490, 0);
        w16(vmcb, 0x492, 0x008B);     // 64-bit TSS type
        w32(vmcb, 0x494, 0xFFFF);
        w64(vmcb, 0x498, 0);
        
        // CPL (0x4CB)
        w8(vmcb, 0x4CB, 0);
        
        // EFER (0x4D0): SCE|LME|LMA|NXE, no SVME
        w64(vmcb, 0x4D0, (1 << 0) | (1 << 8) | (1 << 10) | (1 << 11));
        
        // CR4 (0x548)
        w64(vmcb, 0x548, read_cr4() | (1 << 5)); // PAE
        
        // CR3 (0x550)
        w64(vmcb, 0x550, read_cr3());
        
        // CR0 (0x558)
        w64(vmcb, 0x558, read_cr0());
        
        // DR7 (0x560)
        w64(vmcb, 0x560, 0x400);
        
        // DR6 (0x568)
        w64(vmcb, 0x568, 0xFFFF0FF0);
        
        // RFLAGS (0x570)
        w64(vmcb, 0x570, 0x2);
        
        // RIP (0x578)
        let guest_rip = guest_entry as *const () as u64;
        w64(vmcb, 0x578, guest_rip);
        
        // RSP (0x5D8)
        let guest_rsp = core::ptr::addr_of!(GUEST_STACK) as u64 + 4096 - 16;
        w64(vmcb, 0x5D8, guest_rsp);
        
        // RAX (0x5F8)
        w64(vmcb, 0x5F8, 0);
        
        serial_print("::GATE4:: RIP=0x");
        print_hex(guest_rip);
        serial_println("");

        // GATE 5: VMRUN
        serial_println("::GATE5:: VMRUN...");
        let vmcb_pa = vmcb as u64;
        
        // Load RAX with VMCB physical address and execute VMRUN
        asm!(
            "push rax",
            "push rbx",
            "push rcx",
            "push rdx",
            "push rsi",
            "push rdi",
            "push rbp",
            "push r8",
            "push r9",
            "push r10",
            "push r11",
            "push r12",
            "push r13",
            "push r14",
            "push r15",
            "clgi",
            "vmrun",
            "stgi",
            "pop r15",
            "pop r14",
            "pop r13",
            "pop r12",
            "pop r11",
            "pop r10",
            "pop r9",
            "pop r8",
            "pop rbp",
            "pop rdi",
            "pop rsi",
            "pop rdx",
            "pop rcx",
            "pop rbx",
            "pop rax",
            in("rax") vmcb_pa,
            options(nostack)
        );

        // GATE 6: Read VMEXIT
        let exit_code = r64(vmcb, 0x070);
        let exit_info1 = r64(vmcb, 0x078);
        
        serial_print("::VMEXIT:: code=0x");
        print_hex(exit_code);
        serial_print(" info1=0x");
        print_hex(exit_info1);
        serial_println("");
        
        if exit_code == 0x72 {
            serial_println("==================================");
            serial_println(" SUCCESS: CPUID INTERCEPT (0x72) ");
            serial_println(" PHASE 2 COMPLETE                ");
            serial_println(" RING-1 GOVERNOR ACTIVE          ");
            serial_println("==================================");
        } else if exit_code == 0x7F {
            serial_println("SHUTDOWN: Check guest state");
        } else if exit_code == 0x81 {
            serial_println("VMRUN intercept");
        }
        
        serial_println("Done.");
    }

    loop { unsafe { asm!("hlt"); } }
}

#[no_mangle]
#[naked]
pub unsafe extern "C" fn guest_entry() -> ! {
    asm!(
        "xor eax, eax",
        "cpuid",
        "2:",
        "vmmcall",
        "jmp 2b",
        options(noreturn)
    );
}

// VMCB helpers
#[inline(always)] unsafe fn w8(v: *mut u8, o: usize, x: u8) { core::ptr::write_volatile(v.add(o), x); }
#[inline(always)] unsafe fn w16(v: *mut u8, o: usize, x: u16) { core::ptr::write_volatile(v.add(o) as *mut u16, x); }
#[inline(always)] unsafe fn w32(v: *mut u8, o: usize, x: u32) { core::ptr::write_volatile(v.add(o) as *mut u32, x); }
#[inline(always)] unsafe fn w64(v: *mut u8, o: usize, x: u64) { core::ptr::write_volatile(v.add(o) as *mut u64, x); }
#[inline(always)] unsafe fn r64(v: *const u8, o: usize) -> u64 { core::ptr::read_volatile(v.add(o) as *const u64) }

// Serial I/O
unsafe fn serial_init() {
    outb(0x3F9, 0x00); outb(0x3FB, 0x80); outb(0x3F8, 0x01);
    outb(0x3F9, 0x00); outb(0x3FB, 0x03); outb(0x3FA, 0xC7); outb(0x3FC, 0x0B);
}
fn serial_print(s: &str) { for b in s.bytes() { unsafe { while (inb(0x3FD) & 0x20) == 0 {} outb(0x3F8, b); }}}
fn serial_println(s: &str) { serial_print(s); serial_print("\n"); }
fn print_hex(val: u64) {
    const H: &[u8; 16] = b"0123456789ABCDEF";
    for i in (0..16).rev() { unsafe { while (inb(0x3FD)&0x20)==0{} outb(0x3F8, H[((val>>(i*4))&0xF) as usize]); }}
}
#[inline(always)] unsafe fn outb(p: u16, v: u8) { asm!("out dx, al", in("dx") p, in("al") v, options(nomem, nostack, preserves_flags)); }
#[inline(always)] unsafe fn inb(p: u16) -> u8 { let r: u8; asm!("in al, dx", out("al") r, in("dx") p, options(nomem, nostack, preserves_flags)); r }
fn read_cr0() -> u64 { let r: u64; unsafe { asm!("mov {}, cr0", out(reg) r, options(nomem, nostack)); } r }
fn read_cr3() -> u64 { let r: u64; unsafe { asm!("mov {}, cr3", out(reg) r, options(nomem, nostack)); } r }
fn read_cr4() -> u64 { let r: u64; unsafe { asm!("mov {}, cr4", out(reg) r, options(nomem, nostack)); } r }

#[panic_handler]
fn panic(_: &PanicInfo) -> ! { serial_println("PANIC"); loop { unsafe { asm!("hlt"); } } }
