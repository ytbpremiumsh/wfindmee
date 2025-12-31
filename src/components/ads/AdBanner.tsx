export function AdBanner({ slot = 'default' }: { slot?: string }) {
  return (
    <div className="w-full bg-muted/50 border border-dashed border-border rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground">
        Iklan - Google AdSense Slot: {slot}
      </p>
      <div className="h-20 md:h-24 flex items-center justify-center text-muted-foreground text-sm">
        [Space untuk iklan Adsense]
      </div>
    </div>
  );
}
