import React from 'react';
import { HelpCircle, Gift, Award, HelpCircle as HelpIcon, Building } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-gray-300 text-xs border-t border-zinc-800 transition-colors duration-200 mt-auto">
      
      {/* Top detailed columns */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-6 gap-8">
        
        <div>
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">About</h5>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Flipkart Stories</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">Help</h5>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">Consumer Policy</h5>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">Terms Of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">Social</h5>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="#" className="hover:underline">Twitter / X</a></li>
            <li><a href="#" className="hover:underline">YouTube</a></li>
          </ul>
        </div>

        {/* Office addresses */}
        <div className="border-l border-zinc-800 pl-4 md:col-span-1">
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">Mail Us:</h5>
          <p className="leading-relaxed text-gray-400">
            Flipkart Internet Private Limited,<br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103,<br />
            Karnataka, India
          </p>
        </div>

        <div className="border-l border-zinc-800 pl-4 md:col-span-1">
          <h5 className="text-zinc-500 font-bold uppercase mb-3 text-[10px]">Registered Office:</h5>
          <p className="leading-relaxed text-gray-400">
            Flipkart Internet Private Limited,<br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103,<br />
            Karnataka, India<br />
            CIN : U51109KA2012PTC066107<br />
            Telephone: <span className="text-flipkart-blue hover:underline cursor-pointer">044-45614700</span>
          </p>
        </div>

      </div>

      {/* Bottom links and legal */}
      <div className="border-t border-zinc-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            <a href="#" className="flex items-center gap-1.5 hover:text-white">
              <Building className="w-3.5 h-3.5 text-flipkart-yellow" />
              <span>Become a Seller</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-white">
              <Award className="w-3.5 h-3.5 text-flipkart-yellow" />
              <span>Advertise</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-white">
              <Gift className="w-3.5 h-3.5 text-flipkart-yellow" />
              <span>Gift Cards</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-white">
              <HelpCircle className="w-3.5 h-3.5 text-flipkart-yellow" />
              <span>Help Center</span>
            </a>
          </div>

          <p>© 2007-2026 Flipkart.com. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <img 
              src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c4aa81.svg" 
              alt="Payment Methods" 
              className="h-4 opacity-75"
            />
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
