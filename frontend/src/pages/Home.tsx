import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Are You a Veterinary Professional?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-primary-foreground/90">
            Join our platform as a veterinary professional and contribute to better animal healthcare in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px_8 py-4" asChild>
              <Link to="/register">
                Register as Veterinarian
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-primary-foreground text-green-600 hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;