
import type { CommunityPost } from '@/lib/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bot, Gem } from 'lucide-react';
import { FactCheckAlert } from './fact-check-alert';
import { PremiumBlur } from './premium-blur';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: CommunityPost;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

  const timeAgo = post.createdAt
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: es })
    : 'hace un momento';
    
  const isCurrentUserAuthor = user?.uid === post.authorId;
  const isVisitorPremium = user?.plan !== 'Básico';
  const isPostPremium = post.authorPlan !== 'Básico';
  const isExpertAdviceLocked = isPostPremium && !isVisitorPremium && !isCurrentUserAuthor;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">{post.authorName}</CardTitle>
                {isPostPremium ? (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                        <Gem className="mr-1 h-3 w-3" /> VIP
                    </Badge>
                ) : (
                    <Badge variant="secondary">Básico</Badge>
                )}
            </div>
            <CardDescription className="text-xs">{timeAgo} en <span className="font-medium text-primary">{post.category}</span></CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-foreground/90">{post.content}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        {post.aiAnalysis?.status === 'flagged' && post.aiAnalysis.warningMessage && (
            <FactCheckAlert message={post.aiAnalysis.warningMessage} />
        )}
        
        {post.aiAnalysis?.expertAdvice && (
          <div className={cn(
              "w-full p-4 rounded-lg bg-muted/50 border",
              isExpertAdviceLocked ? "border-amber-500/20" : "border-transparent"
          )}>
              <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-sm text-primary">Análisis del Experto IA</h4>
              </div>
              <PremiumBlur isLocked={isExpertAdviceLocked}>
                  <div className="prose prose-sm dark:prose-invert prose-p:text-muted-foreground prose-p:m-0 max-w-none whitespace-pre-wrap">
                      {post.aiAnalysis.expertAdvice}
                  </div>
              </PremiumBlur>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
