use uefi::prelude::*;

#[repr(C, packed)]
pub struct Vmcb {
    pub control_area: [u8; 1024],
    pub save_state_area: [u8; 1024],
}

impl Vmcb {
    pub fn new() -> Self {
        Self {
            control_area: [0; 1024],
            save_state_area: [0; 1024],
        }
    }
}

pub fn check_svm_support() -> bool {
    // TODO: Implement CPUID check for AMD-V
    // For prototype, we assume we are on the GEEKOM A9 MAX (Ryzen 9)
    true
}

pub fn enable_svm() -> Status {
    log::info!("Enabling AMD-V...");
    // TODO: Write to EFER MSR to set SVME bit
    Status::SUCCESS
}
