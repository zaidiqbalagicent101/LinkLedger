import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { ArrowRight, Check } from "lucide-react";

const font = Instrument_Sans({ subsets: ["latin"], display: "swap" });

const listings = [
  { name: "Stackline", niche: "Tech & SaaS", dr: 81, traffic: "520K", price: "$690" },
  { name: "Northwind Review", niche: "Business & finance", dr: 72, traffic: "340K", price: "$420" },
  { name: "Fieldnotes Daily", niche: "Lifestyle", dr: 64, traffic: "180K", price: "$260" },
];

const steps = [
  { title: "Browse", text: "Compare publishers by niche, domain rating, traffic and price." },
  { title: "Order", text: "Send your brief or article and pay securely through LinkLedger." },
  { title: "Go live", text: "Approve the post, then track your link after it is published." },
];

const buttonStyles = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0e7a5a]";
const primaryButtonStyles = `${buttonStyles} border-transparent bg-[#0e7a5a] text-white hover:bg-[#0a6149]`;
const secondaryButtonStyles = `${buttonStyles} border-[#cfd8d4] bg-white text-[#12211c] hover:border-[#12211c]`;

export default function LandingPage() {
  return (
    <main className={`${font.className} min-h-screen bg-white text-[#12211c] antialiased`}>
      <header className="border-b border-[#e5eae8]">
        <div className="mx-auto flex h-16 w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link className="inline-flex items-center gap-2.5 text-[17px] font-bold" href="/" aria-label="LinkLedger home">
            <span className="grid size-7 place-items-center rounded-[7px] bg-[#0e7a5a] text-[15px] text-white">L</span>
            LinkLedger
          </Link>
          <nav className="flex items-center gap-5 text-[15px] max-[720px]:gap-3 max-[720px]:text-[14px]" aria-label="Main navigation">
            <a className="text-[#5f6f69] hover:text-[#12211c] max-[720px]:hidden" href="#how-it-works">How it works</a>
            <Link className="text-[#5f6f69] hover:text-[#12211c]" href="/login">Log in</Link>
            <Link className={`${primaryButtonStyles} min-h-9 px-3.5 text-[14px] !text-white`} href="/register/advertiser">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="px-5 pb-[72px] pt-[88px] text-center max-[720px]:pb-12 max-[720px]:pt-14">
        <div className="mx-auto w-full max-w-[1040px]">
          <h1 className="mx-auto max-w-[760px] text-[56px] leading-[1.08] font-semibold max-[760px]:text-[46px] max-[480px]:text-[36px]">
            Guest posts and sponsored content, ordered in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-relaxed text-[#5f6f69]">
            A marketplace where advertisers buy placements on independent sites
            and publishers get paid for them.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 max-[720px]:flex-col">
            <Link className={`${secondaryButtonStyles} max-[720px]:w-full`} href="/register/advertiser">
              Sign up as advertiser 
            </Link>
            <Link className={`${secondaryButtonStyles} max-[720px]:w-full`} href="/register/publisher">
              Sign up as publisher
            </Link>
          </div>

          <div className="mx-auto mt-14 max-w-[760px] overflow-hidden rounded-lg border border-[#e5eae8] text-left shadow-[0_20px_50px_-30px_rgba(18,33,28,0.3)]" role="img" aria-label="Example publisher listings with domain rating, monthly traffic and price">
            <div className="grid grid-cols-[minmax(0,2fr)_0.6fr_1fr_0.7fr] items-center gap-3 bg-[#f6f8f7] px-5 py-2.5 text-[13px] font-semibold text-[#5f6f69] max-[720px]:grid-cols-[minmax(0,2fr)_0.6fr_0.8fr]">
              <span>Publisher</span><span>DR</span><span className="max-[720px]:hidden">Traffic / mo</span><span className="text-right">Price</span>
            </div>
            {listings.map((listing) => (
              <div className="grid grid-cols-[minmax(0,2fr)_0.6fr_1fr_0.7fr] items-center gap-3 border-t border-[#e5eae8] px-5 py-3.5 text-[14.5px] max-[720px]:grid-cols-[minmax(0,2fr)_0.6fr_0.8fr]" key={listing.name} aria-hidden="true">
                <span><b className="block font-semibold">{listing.name}</b><small className="text-[13px] text-[#5f6f69]">{listing.niche}</small></span>
                <span>{listing.dr}</span>
                <span className="max-[720px]:hidden">{listing.traffic}</span>
                <span className="text-right font-semibold">{listing.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5eae8] px-5 py-[72px] max-[720px]:py-14" id="how-it-works">
        <div className="mx-auto w-full max-w-[1040px]">
          <h2 className="text-center text-[34px] leading-tight font-semibold max-[480px]:text-[28px]">How it works</h2>
          <div className="mt-11 grid grid-cols-3 gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-7">
            {steps.map((step, index) => (
              <div key={step.title}>
                <h3 className="flex items-center gap-2.5 text-[18px] font-semibold">
                  <span className="grid size-[26px] place-items-center rounded-full bg-[#e4f3ed] text-[13px] font-bold text-[#0a6149]">{index + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15.5px] text-[#5f6f69]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5eae8] px-5 py-[72px] max-[720px]:py-14">
        <div className="mx-auto w-full max-w-[1040px]">
          <h2 className="text-center text-[34px] leading-tight font-semibold max-[480px]:text-[28px]">Choose how you want to use it</h2>
          <div className="mt-11 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1 max-[720px]:gap-7">
            <div className="rounded-lg border border-[#e5eae8] p-7">
              <h3 className="text-[19px] font-semibold">Advertisers</h3>
              <ul className="my-4 mb-[22px] grid list-none gap-2.5 p-0 text-[15.5px] text-[#5f6f69]">
                <li className="flex gap-2.5"><Check className="mt-1 shrink-0 text-[#0e7a5a]" size={16} /> Compare publishers on the same metrics</li>
                <li className="flex gap-2.5"><Check className="mt-1 shrink-0 text-[#0e7a5a]" size={16} /> Approve every post before it goes live</li>
              </ul>
              <Link
              className={`${primaryButtonStyles} !text-white`} href="/register/advertiser"
            >
              Sign up as advertiser
            </Link>
            </div>
            <div className="rounded-lg border border-[#e5eae8] p-7">
              <h3 className="text-[19px] font-semibold">Publishers</h3>
              <ul className="my-4 mb-[22px] grid list-none gap-2.5 p-0 text-[15.5px] text-[#5f6f69]">
                <li className="flex gap-2.5"><Check className="mt-1 shrink-0 text-[#0e7a5a]" size={16} /> Set your own prices and content rules</li>
                <li className="flex gap-2.5"><Check className="mt-1 shrink-0 text-[#0e7a5a]" size={16} /> Get paid once the post is approved</li>
              </ul>
              <Link className={secondaryButtonStyles} href="/register/publisher">Sign up as publisher</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5eae8] px-5 py-7 text-[14px]">
        <div className="mx-auto flex w-full max-w-[1040px] flex-wrap justify-between gap-3">
          <span className="text-[#5f6f69]">© 2026 LinkLedger</span>
          <span className="text-[#5f6f69]">Already have an account? <Link className="font-semibold text-[#0a6149]" href="/login">Log in</Link></span>
        </div>
      </footer>
    </main>
  );
}