'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, Newspaper, Shield, User, Copy, FileText as ScriptIcon } from 'lucide-react';
import Link from 'next/link';
import { PremiumBlur } from '@/components/community/premium-blur';
import Logo from '@/components/shared/logo';
import { EducationalResource } from '@/lib/types';
import { educationalResources as allPublicResources } from '@/lib/educational-resources';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ConversionSidebar } from '@/components/resources/conversion-sidebar';

function renderContent(resource: EducationalResource) {
    if (resource.type === 'video' && resource.mediaUrl) {
        return (
            <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                    width="100%"
                    height="100%"
                    src={resource.mediaUrl}
                    title={resource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
     if (resource.type === 'podcast' && resource.mediaUrl) {
        return (
            <iframe 
                style={{borderRadius: '12px'}} 
                src={resource.mediaUrl}
                width="100%" 
                height="152" 
                frameBorder="0" 
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
        );
    }
    
    // Default to article/script content
    return resource.content.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
    ));
}

export default function ResourcePage() {
  const params = useParams();
  const { toast } = useToast();
  const [resource, setResource] = useState<EducationalResource | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (params.slug) {
        // Directly use the imported resources
        const res = allPublicResources.find(r => r.slug === params.slug && r.status === 'published');
        if (res) {
            setResource(res);
        } else {
            notFound();
        }
        setLoading(false);
    }
  }, [params.slug]);

  const handleCopy = () => {
    if (resource?.content) {
      navigator.clipboard.writeText(resource.content);
      toast({
        title: 'Copiado al portapapeles',
        description: 'El guion está listo para que lo pegues.',
      });
    }
  };

  if (loading) {
    return <div className="bg-[#0a0a0a] min-h-screen"></div>; // Or a proper skeleton loader
  }

  if (!resource) {
    notFound();
  }
  
  const resourceIconMap = {
    article: Newspaper,
    podcast: Mic,
    video: Mic, // Could be Film icon
    script: ScriptIcon,
    template: ScriptIcon,
    guide: ScriptIcon,
    tool: ScriptIcon,
  };
  
  const ResourceIcon = resourceIconMap[resource.type];


  return (
    <div className="bg-[#0a0a0a] text-gray-200 min-h-screen">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Logo className="invert brightness-0" />
          <Button asChild variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
            <Link href="/resources">
              <ArrowLeft className="mr-2" />
              Volver a Recursos
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <article className="lg:col-span-9">
                <header className="mb-8">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <ResourceIcon className="h-5 w-5" />
                        <span className="font-semibold uppercase text-sm tracking-wider">{resource.type}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-tight tracking-tighter mb-4">
                        {resource.title}
                    </h1>
                     <div className="flex flex-wrap gap-2 items-center">
                        <p className="text-sm text-gray-500">
                            Publicado el {new Date(resource.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {resource.isPremium && <Badge variant="destructive" className="bg-amber-500/80 border-0">Contenido Premium</Badge>}
                        {resource.type === 'script' && !resource.isPremium && (
                            <Button onClick={handleCopy} size="sm">
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Guion
                            </Button>
                        )}
                    </div>
                </header>

                <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                    <Image
                        src={resource.image}
                        alt={resource.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={resource.imageHint}
                        priority
                    />
                </div>
                
                <PremiumBlur isLocked={resource.isPremium}>
                    <div className="prose prose-invert lg:prose-lg max-w-none text-muted-foreground prose-headings:text-white prose-strong:text-white/90 prose-a:text-primary hover:prose-a:text-primary/80 whitespace-pre-wrap leading-relaxed">
                        {renderContent(resource)}
                    </div>
                </PremiumBlur>
            </article>

           <ConversionSidebar />
        </div>
      </main>
    </div>
  );
}
