
import React from 'react';
import { Separator } from "@/components/ui/separator";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-white border-t">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Email Insight Navigator
            </p>
          </div>
          
          <Separator orientation="vertical" className="hidden md:block h-8" />
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://raufjatoi.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-darkRed-700 transition-colors"
            >
              Abdul Rauf Jatoi
            </a>
            
            <Separator orientation="vertical" className="h-4" />
            
            <span className="text-sm font-medium">
              Icreativiz Technologies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
