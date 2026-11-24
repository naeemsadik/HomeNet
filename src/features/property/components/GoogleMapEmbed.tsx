/**
 * Google's embedded map for a listing, on the web. The app has its own file
 * (GoogleMapEmbed.native.tsx) so the web view library stays out of the website's bundle.
 */
export type GoogleMapEmbedProps = {
  title: string;
  embedUrl: string;
};

export function GoogleMapEmbed({ title, embedUrl }: GoogleMapEmbedProps) {
  return (
    <iframe
      title={`Google Map for ${title}`}
      src={embedUrl}
      style={{ width: "100%", height: "100%", border: 0, borderRadius: 16 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
