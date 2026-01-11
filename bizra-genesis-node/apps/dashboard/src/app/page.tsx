import { BizraHero } from "@/components/hero/bizra-hero"
import { GenesisSection } from "@/components/sections/genesis-section"
import { ProtocolSection } from "@/components/sections/protocol-section"
import { FooterSection } from "@/components/sections/footer-section"

export default function Page() {
  return (
    <main>
      <BizraHero />
      <GenesisSection />
      <ProtocolSection />
      <FooterSection />
    </main>
  )
}
