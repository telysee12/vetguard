import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl mb-4">
              <Shield className="h-8 w-8 text-primary-glow" />
              <span>VetGard System</span>
            </Link>
            <p className="text-background/80 mb-4">
              Streamlining veterinary services through comprehensive management, 
              licensing, and reporting for improved animal healthcare nationwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-background/80 hover:text-primary-glow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/vets" className="text-background/80 hover:text-primary-glow transition-colors">
                  Find Veterinarians
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-background/80 hover:text-primary-glow transition-colors">
                  Verify License
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-background/80 hover:text-primary-glow transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-background/80">
              <li>Veterinary Licensing</li>
              <li>Medicine Management</li>
              <li>Report Tracking</li>
              <li>Document Verification</li>
              <li>Multi-Level Administration</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@vetgard.rw</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+250 788 000 000</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Kigali, Rwanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2024 VetGard Management System. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-background/60 hover:text-primary-glow text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/60 hover:text-primary-glow text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/support" className="text-background/60 hover:text-primary-glow text-sm transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;