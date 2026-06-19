import Navbar from "@/components/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/*
        Navbar height: mobile = 56px top row + 38px nav row = 94px
                       desktop (md+) = 56px top row only
        We apply this offset here once, so no individual page needs pt-[60px].
      */}
      <div className="pt-[94px] md:pt-[56px]">
        {children}
      </div>
    </>
  );
}
