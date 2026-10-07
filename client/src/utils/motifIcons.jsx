import React from 'react';
import {
  Megaphone,
  MessageSquare,
  Bell,
  BookOpen,
  Code,
  MessageCircle,
  Cpu,
  FlaskConical,
  Building2,
  Radio,
  Zap,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Terminal,
  Sparkles,
  Trophy,
  Hash,
} from 'lucide-react';

const MOTIF_MAP = {
  Megaphone,
  MessageSquare,
  Bell,
  BookOpen,
  Code,
  MessageCircle,
  Cpu,
  FlaskConical,
  Building2,
  Radio,
  Zap,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Terminal,
  Sparkles,
  Trophy,
  Hash,
};

export const RenderMotifIcon = ({ iconName, className = 'w-3.5 h-3.5' }) => {
  const IconComponent = MOTIF_MAP[iconName] || Hash;
  return <IconComponent className={className} />;
};
