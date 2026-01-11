import type React from 'react';
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

export const KEEPSAKE_TYPE_ICON_COMPONENTS: Record<KeepsakeType, LucideIcon> = {
  document: File,
  letter: Mail,
  photo: Camera,
  video: Video,
  wish: Star,
  scheduled_action: CalendarClock,
};

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

export const MEDIA_TYPE_ICON_COMPONENTS: Record<string, LucideIcon> = {
  image: Image,
  video: FileVideo,
  document: File,
};

interface KeepsakeTypeIconProps extends LucideProps {
  type: KeepsakeType;
}

export function KeepsakeTypeIcon({ type, ...props }: KeepsakeTypeIconProps): React.ReactElement {
  const IconComponent = KEEPSAKE_TYPE_ICON_COMPONENTS[type] || File;
  return <IconComponent {...props} />;
}

interface RelationshipIconProps extends LucideProps {
  relationship: Relationship;
}

export function RelationshipIcon({
  relationship,
  ...props
}: RelationshipIconProps): React.ReactElement {
  const IconComponent = RELATIONSHIP_ICON_COMPONENTS[relationship] || User;
  return <IconComponent {...props} />;
}

interface MediaTypeIconProps extends LucideProps {
  mediaType: 'image' | 'video' | 'document';
}

export function MediaTypeIcon({ mediaType, ...props }: MediaTypeIconProps): React.ReactElement {
  const IconComponent = MEDIA_TYPE_ICON_COMPONENTS[mediaType] || File;
  return <IconComponent {...props} />;
}
