ENTRY(_start)

SECTIONS {
    . = 0x80000000; /* Standard high-half start for bootloader 0.9 kernels */

    .text : {
        *(.text .text.*)
    }

    .rodata : {
        *(.rodata .rodata.*)
    }

    .data : {
        *(.data .data.*)
    }

    .bss : {
        *(.bss .bss.*)
    }
}
