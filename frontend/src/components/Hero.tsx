import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Shield, Users, FileCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/vet-hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage}
          alt="Professional veterinary management system"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero/90"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-primary-foreground rounded-full"></div>
        <div className="absolute top-40 right-32 w-20 h-20 border border-primary-foreground rounded-full"></div>
        <div className="absolute bottom-32 left-32 w-24 h-24 border border-primary-foreground rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto text-primary-foreground">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
            Veterinary
            <br />
            <span className="text-primary-glow">Management</span>
            <br />
            Excellence
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 text-primary-foreground/90 animate-fade-in">
            Streamlining veterinary services through comprehensive 
            licensing, reporting, and medicine management nationwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button size="xl" variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Secure Licensing',
                description: 'Multi-level approval system with document verification'
              },
              {
                icon: Users,
                title: 'Multi-Role Access',
                description: 'Country, District, Sector admin management'
              },
              {
                icon: FileCheck,
                title: 'Report Management',
                description: 'Comprehensive reporting and medicine tracking'
              },
              {
                icon: MapPin,
                title: 'Location-Based',
                description: 'Find approved vets by province and sector'
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-card/10 backdrop-blur-sm border-primary-foreground/20 p-6 animate-slide-in hover:bg-card/20 transition-all duration-300">
                <feature.icon className="h-12 w-12 text-primary-glow mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2 text-primary-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;