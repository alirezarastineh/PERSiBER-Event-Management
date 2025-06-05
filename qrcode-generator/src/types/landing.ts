export interface HeroSectionProps {
  readonly isAuthenticated: boolean;
  readonly containerVariants: any;
  readonly itemVariants: any;
}

export interface FeaturesSectionProps {
  readonly featureVariants: any;
}

export interface Feature {
  readonly id: string;
  readonly text: string;
  readonly title: string;
  readonly desc: string;
  readonly icon: string;
}
