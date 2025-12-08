import Header from "@/components/Header";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            About PeakFlow
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed animate-slide-up stagger-1">
            A personal blog dedicated to helping you optimize your life through productivity tips, lifestyle insights, and the latest in tech.
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-16 space-y-6 text-muted-foreground animate-slide-up stagger-2">
          <h2 className="text-3xl font-bold text-foreground mb-6">The Story Behind PeakFlow</h2>
          <p>
            PeakFlow started as a personal journey to document what actually works when it comes to being more 
            productive, living intentionally, and leveraging technology to simplify life. After years of 
            experimenting with different systems, tools, and habits, I wanted to share the insights that made 
            a real difference.
          </p>
          <p>
            In a world overflowing with productivity advice and tech recommendations, I focus on what's 
            practical and actionable. No fluff, no complicated systems—just real strategies that fit into 
            everyday life. Whether you're looking to streamline your workflow, discover useful apps, or 
            build better habits, you'll find content designed to help you thrive.
          </p>
          <p>
            This blog covers productivity frameworks that actually stick, lifestyle choices that boost 
            well-being, and tech tips that save time and energy. My goal is to help you work smarter, 
            live better, and make technology work for you—not the other way around.
          </p>
        </section>

        {/* Topics Section */}
        <section className="mb-16 rounded-2xl bg-card p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">What I Write About</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              PeakFlow covers the intersection of productivity, lifestyle, and technology. Here's what you can expect:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span><strong>Productivity:</strong> Time management techniques, focus strategies, goal-setting frameworks, and workflow optimization</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span><strong>Lifestyle:</strong> Habit building, work-life balance, mindfulness practices, and intentional living</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span><strong>Tech Tips:</strong> App reviews, software tutorials, automation guides, and digital tools to boost efficiency</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span><strong>Personal Growth:</strong> Learning strategies, skill development, and self-improvement insights</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">My Approach</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Practical First</h3>
              <p className="text-muted-foreground">
                Every tip and strategy I share has been tested in real life. If it doesn't work practically, it doesn't make it to the blog.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">No Gatekeeping</h3>
              <p className="text-muted-foreground">
                Knowledge should be accessible. I share everything I learn—the wins, the failures, and the lessons in between.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Simplicity Over Complexity</h3>
              <p className="text-muted-foreground">
                The best systems are simple. I focus on sustainable approaches that don't require constant maintenance.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted">
              <h3 className="text-xl font-semibold mb-3">Continuous Learning</h3>
              <p className="text-muted-foreground">
                Technology and best practices evolve. I stay curious and update my recommendations as I discover better solutions.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 rounded-2xl bg-card">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get the latest productivity tips, tech recommendations, and lifestyle insights delivered straight to your inbox.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
            <Mail className="mr-2 h-4 w-4" />
            Subscribe to Newsletter
          </Button>
        </section>
      </main>
    </div>
  );
};

export default About;
