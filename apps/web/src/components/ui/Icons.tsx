import {
  FileText,
  Mail,
  Camera,
  Video,
  Star,
  CalendarClock,
  Image,
  FileVideo,
  File,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Heart,
  Baby,
  Users,
  UserRound,
  Handshake,
  Briefcase,
  User,
  Lock,
  Globe,
  ShieldCheck,
  Plus,
  Vault,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import type { KeepsakeType, Relationship } from '@/types';

// Re-export individual icons for direct use
export {
  FileText,
  Mail,
  Camera,
  Video,
  Star,
  CalendarClock,
  Image,
  FileVideo,
  File,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Heart,
  Baby,
  Users,
  UserRound,
  Handshake,
  Briefcase,
  User,
  Lock,
  Globe,
  ShieldCheck,
  Plus,
  Vault,
};

// Keepsake type icons mapping
export const KEEPSAKE_TYPE_ICON_COMPONENTS: Record<KeepsakeType, LucideIcon> = {
  text: FileText,
  letter: Mail,
  photo: Camera,
  video: Video,
  wish: Star,
  scheduled_action: CalendarClock,
};

// Relationship icons mapping
export const RELATIONSHIP_ICON_COMPONENTS: Record<Relationship, LucideIcon> = {
  SPOUSE: Heart,
  CHILD: Baby,
  PARENT: Users,
  SIBLING: UserRound,
  GRANDCHILD: Baby,
  GRANDPARENT: Users,
  FRIEND: Handshake,
  COLLEAGUE: Briefcase,
  OTHER: User,
};

// Media type icons
export const MEDIA_TYPE_ICON_COMPONENTS: Record<string, LucideIcon> = {
  image: Image,
  video: FileVideo,
  document: File,
};

// Keepsake Type Icon component
interface KeepsakeTypeIconProps extends LucideProps {
  type: KeepsakeType;
}

export function KeepsakeTypeIcon({ type, ...props }: KeepsakeTypeIconProps) {
  const IconComponent = KEEPSAKE_TYPE_ICON_COMPONENTS[type] || File;
  return <IconComponent {...props} />;
}

// Relationship Icon component
interface RelationshipIconProps extends LucideProps {
  relationship: Relationship;
}

export function RelationshipIcon({ relationship, ...props }: RelationshipIconProps) {
  const IconComponent = RELATIONSHIP_ICON_COMPONENTS[relationship] || User;
  return <IconComponent {...props} />;
}

// Media Type Icon component
interface MediaTypeIconProps extends LucideProps {
  mediaType: 'image' | 'video' | 'document';
}

export function MediaTypeIcon({ mediaType, ...props }: MediaTypeIconProps) {
  const IconComponent = MEDIA_TYPE_ICON_COMPONENTS[mediaType] || File;
  return <IconComponent {...props} />;
}
