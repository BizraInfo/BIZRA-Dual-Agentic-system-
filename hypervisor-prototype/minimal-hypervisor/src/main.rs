#![no_std]
#![no_main]

extern crate alloc;

mod svm;

use uefi::prelude::*;
use uefi_services::init;

#[entry]
fn main(_image_handle: Handle, mut system_table: SystemTable<Boot>) -> Status {
    init(&mut system_table).unwrap();
    log::info!("===================================");
    log::info!("       BIZRA ZERO v0.1             ");
    log::info!("   Hypervisor Prototype Active     ");
    log::info!("===================================");
    log::info!("UEFI Boot Stub Loaded Successfully.");

    // Stall for 5 seconds to let user read the output
    system_table.boot_services().stall(5_000_000);

    Status::SUCCESS
}
