"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2Icon, ExternalLinkIcon } from "lucide-react";
import { wordpressSiteInfo } from "@/app/actions/wordpress";
import Image from "next/image";

export default function SiteInfos({ selectedSiteUrl }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!selectedSiteUrl) {
      setInfo(null);
      setLogoError(false);
      return;
    }
    setLoading(true);
    setLogoError(false);
    wordpressSiteInfo({ url: selectedSiteUrl })
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [selectedSiteUrl]);

  if (!selectedSiteUrl) return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Chargement des infos du site…</span>
        </CardContent>
      </Card>
    );
  }

  if (!info) return null;

  const adminUrl = info.admin_url || `${info.url?.replace(/\/?$/, "")}/wp-admin`;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-6 py-6">
        <div className="flex items-center gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-muted/30 flex items-center justify-center">
            {info.logo_url && !logoError ? (
              <img
                src={info.logo_url}
                alt={info.site_name || "Logo"}
                className="size-full object-contain"
                onError={() => setLogoError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Image
                src="/wordpress.svg"
                alt=""
                width={36}
                height={36}
                className="opacity-60"
              />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">
              {info.site_name || "Sans titre"}
            </h2>
            {info.tagline && (
              <p className="text-sm text-muted-foreground">{info.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <a
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                {info.url}
                <ExternalLinkIcon className="size-3.5" />
              </a>
              <span>•</span>
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                Backoffice
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
