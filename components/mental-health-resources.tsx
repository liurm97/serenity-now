"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, BookOpen, PhoneCall, Heart, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MentalHealthResourcesProps {
  riskLevel: "low" | "moderate" | "high";
}

export function MentalHealthResources({
  riskLevel,
}: MentalHealthResourcesProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("articles");

  const resources = {
    low: {
      articles: [
        {
          title: "Mindfulness Practice for Everyday Life",
          description:
            "Incorporate simple mindfulness techniques into your daily routine.",
          url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
        },
        {
          title: "Self-Care Strategies for Mental Wellness",
          description: "Practical tips to maintain your positive mental state.",
          url: "https://www.psychologytoday.com/us/blog/click-here-happiness/201812/self-care-12-ways-take-better-care-yourself",
        },
      ],
      hotlines: [
        {
          name: "SAMHSA's National Helpline",
          number: "1-800-662-4357",
          description:
            "Free, confidential, 24/7 treatment referral and information service.",
        },
      ],
    },
    moderate: {
      articles: [
        {
          title: "Managing Stress and Anxiety",
          description:
            "Evidence-based techniques to reduce moderate stress and anxiety.",
          url: "https://www.helpguide.org/articles/stress/stress-management.htm",
        },
        {
          title: "Sleep Improvement Strategies",
          description: "How better sleep can improve your mental health.",
          url: "https://www.sleepfoundation.org/mental-health",
        },
        {
          title: "The Benefits of Regular Exercise for Mental Health",
          description:
            "How physical activity helps reduce stress and improve mood.",
          url: "https://www.mayoclinic.org/diseases-conditions/depression/in-depth/depression-and-exercise/art-20046495",
        },
      ],
      hotlines: [
        {
          name: "SAMHSA's National Helpline",
          number: "1-800-662-4357",
          description:
            "Free, confidential, 24/7 treatment referral and information service.",
        },
        {
          name: "Crisis Text Line",
          number: "Text HOME to 741741",
          description: "Free 24/7 support for those in crisis.",
        },
      ],
    },
    high: {
      articles: [
        {
          title: "Understanding and Managing Anxiety",
          description:
            "In-depth guide to managing severe anxiety and panic attacks.",
          url: "https://www.nimh.nih.gov/health/publications/panic-disorder-when-fear-overwhelms",
        },
        {
          title: "Depression: Symptoms, Causes, and Treatment",
          description:
            "Comprehensive information about depression and effective treatments.",
          url: "https://www.nimh.nih.gov/health/topics/depression",
        },
        {
          title: "Finding Professional Mental Health Support",
          description:
            "How to find the right therapist or counselor for your needs.",
          url: "https://www.mentalhealth.gov/get-help/immediate-help",
        },
      ],
      hotlines: [
        {
          name: "National Suicide Prevention Lifeline",
          number: "988 or 1-800-273-8255",
          description:
            "Provides 24/7, free and confidential support for people in distress.",
        },
        {
          name: "Crisis Text Line",
          number: "Text HOME to 741741",
          description: "Free 24/7 support for those in crisis.",
        },
        {
          name: "SAMHSA's National Helpline",
          number: "1-800-662-4357",
          description:
            "Free, confidential, 24/7 treatment referral and information service.",
        },
      ],
    },
  };

  // Get resources based on risk level
  const currentResources = resources[riskLevel];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="w-full mt-6 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          Mental Health Resources
        </CardTitle>
        <CardDescription className="text-purple-700">
          {riskLevel === "high"
            ? "Important resources to help you manage your mental health challenges."
            : riskLevel === "moderate"
            ? "Useful resources to help improve your mental wellbeing."
            : "Resources to help maintain your positive mental state."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <Tabs
          defaultValue="articles"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="articles" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Articles & Guides
            </TabsTrigger>
            <TabsTrigger value="hotlines" className="flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4" />
              Helplines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            {currentResources.articles.map((article, index) => (
              <div
                key={index}
                className="p-4 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <h3 className="font-medium text-purple-800 mb-1">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {article.description}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium"
                >
                  Read more <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="hotlines" className="space-y-4">
            {currentResources.hotlines.map((hotline, index) => (
              <div
                key={index}
                className="p-4 border border-purple-100 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-medium text-blue-800 mb-1">
                  {hotline.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  {hotline.description}
                </p>
                <div className="font-medium text-blue-600 text-lg flex items-center gap-1">
                  <PhoneCall className="h-4 w-4" />
                  {hotline.number}
                </div>
              </div>
            ))}

            {riskLevel === "high" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                <p className="text-red-800 font-medium">
                  If you're experiencing a mental health emergency, please call
                  988 or go to your nearest emergency room.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 flex justify-end">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-full flex items-center gap-1"
        >
          <Home className="h-4 w-4" /> Return Home
        </Button>
      </CardFooter>
    </Card>
  );
}
