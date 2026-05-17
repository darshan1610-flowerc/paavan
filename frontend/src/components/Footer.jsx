import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full relative border-t border-outline-variant/30 bg-surface-container-low mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-lg gap-base w-full max-w-7xl mx-auto mb-20 md:mb-0">
        <div className="font-headline-md text-headline-md text-primary">PAAVAN Go Electric</div>
        <div className="flex gap-md">
          <Link to="/" className="font-label-md text-label-md uppercase text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Fleet
          </Link>
          <Link to="/booking" className="font-label-md text-label-md uppercase text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Pricing
          </Link>
          <a href="#" className="font-label-md text-label-md uppercase text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Locations
          </a>
          <Link to="/support" className="font-label-md text-label-md uppercase text-on-surface-variant hover:text-secondary transition-colors duration-200">
            Support
          </Link>
        </div>
        <div className="font-body-md text-body-md text-primary opacity-60">© 2026 PAAVAN. PRECISION ENGINEERING.</div>
      </div>
    </footer>
  );
};

export default Footer;
