import React from "react";
import { ExternalLink } from "lucide-react";
import { IContactInfo } from "@/app/types/ContactInfo";
import { DEVELOPER_INFO, buildSocialLinks } from "@/lib/developerInfo";
import LinkedInIcon from "./LinkedInIcon";

interface SocialLinkPillsProps {
  contactInfo?: Partial<IContactInfo> | null;
  heading?: string;
}

export const SocialLinkPills: React.FC<SocialLinkPillsProps> = ({
  contactInfo,
  heading = "Social Links",
}) => {
  const socialLinks = buildSocialLinks(contactInfo);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border-subtle/80 pt-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-body">
        {heading}
      </p>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((social) => {
          const contextName =
            social.id === "linkedin" ? DEVELOPER_INFO.name : "EduDrop";
          return (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.label} — ${contextName} (opens in a new tab)`}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3.5 py-1.5 text-xs font-semibold text-text-ink transition-colors hover:border-surface-forest hover:bg-surface-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-forest"
            >
              {social.id === "linkedin" && (
                <LinkedInIcon className="h-3.5 w-3.5" />
              )}
              <span>{social.label}</span>
              <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-70" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLinkPills;
