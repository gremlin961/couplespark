"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Sparkles, MessageCircleQuestion, RotateCw } from 'lucide-react';
import { generateNextQuestion, type GenerateNextQuestionInput } from '@/ai/flows/generate-question';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

export default function CoupleSparkPage() {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0); // For re-triggering animation

  const { toast } = useToast();

  const fetchQuestion = useCallback(async (currentFeedback?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const input: GenerateNextQuestionInput = {};
      if (currentFeedback) {
        input.feedback = currentFeedback;
      }
      const result = await generateNextQuestion(input);
      if (result.question) {
        setCurrentQuestion(result.question);
        setAnimationKey(prevKey => prevKey + 1); // Trigger animation
      } else {
        setError("Couldn't generate a question. Please try again.");
        toast({
          title: "Error",
          description: "Failed to generate a new question.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error generating question:", err);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching a question.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset feedback after it's been used for a new question
      setFeedback(undefined); 
    }
  }, [toast]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleRate = (liked: boolean) => {
    if (currentQuestion) {
      const newFeedback = `User ${liked ? 'liked' : 'disliked'} the question: "${currentQuestion}"`;
      setFeedback(newFeedback);
      toast({
        title: "Feedback Submitted",
        description: liked ? "Thanks for your feedback! We'll try to show you more questions like this." : "Thanks for your feedback! We'll try to show you different questions.",
      });
      // Optionally, immediately fetch a new question after rating
      // fetchQuestion(newFeedback);
    }
  };

  const handleNext = () => {
    fetchQuestion(feedback);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-background text-foreground">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center">
          <Sparkles className="w-12 h-12 mr-3 text-accent" />
          CoupleSpark
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Ignite deeper connections, one question at a time.</p>
      </header>

      <main className="w-full max-w-2xl">
        <Card key={animationKey} className="shadow-xl rounded-xl overflow-hidden animate-in fade-in-0 duration-700 ease-out">
          <CardHeader className="bg-card-foreground/5">
             <CardTitle className="text-2xl font-semibold flex items-center text-primary">
                <MessageCircleQuestion className="w-7 h-7 mr-2 text-accent" />
                Your Question
             </CardTitle>
             <CardDescription className="text-muted-foreground">Ponder this together...</CardDescription>
          </CardHeader>
          <CardContent className="p-6 min-h-[150px] flex items-center justify-center">
            {isLoading ? (
              <div className="space-y-3 w-full">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : error ? (
              <p className="text-destructive text-center">{error}</p>
            ) : currentQuestion ? (
              <p className="text-2xl text-center font-medium text-card-foreground leading-relaxed">
                {currentQuestion}
              </p>
            ) : (
              <p className="text-muted-foreground text-center">No question loaded yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button 
            onClick={() => handleRate(true)} 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto group hover:bg-green-500/10 border-green-500 text-green-600 hover:text-green-700"
            disabled={isLoading || !currentQuestion}
            aria-label="Like question"
          >
            <ThumbsUp className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" /> Like
          </Button>
          <Button 
            onClick={() => handleRate(false)} 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto group hover:bg-red-500/10 border-red-500 text-red-600 hover:text-red-700"
            disabled={isLoading || !currentQuestion}
            aria-label="Dislike question"
          >
            <ThumbsDown className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" /> Dislike
          </Button>
          <Button 
            onClick={handleNext} 
            variant="default" 
            size="lg" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
            aria-label="Next question"
          >
            Next Question <RotateCw className={`w-6 h-6 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} CoupleSpark. Designed to bring you closer.</p>
      </footer>
    </div>
  );
}
