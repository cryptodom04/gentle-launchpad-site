import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Rocket, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TokenCreatorForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '9',
    supply: '1000000000',
    metadataUrl: '',
    freezeAuthority: false,
    mintAuthority: true,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="create" className="py-24 relative">
      <div className="absolute inset-0 stars-bg opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            The world's most powerful
            <br />
            <span className="text-primary">Solana Launcher</span> ever.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-6 md:p-8 glow">
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-primary/80" />
            </div>

            <h3 className="font-display text-xl md:text-2xl font-bold text-center mb-2">
              Solana Token Creator
            </h3>
            <p className="text-muted-foreground text-center mb-8 text-sm md:text-base">
              Create and deploy your Solana token effortlessly in seconds.
            </p>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Token Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Token Name *
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Max 32 characters</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="name"
                    placeholder="My Token"
                    maxLength={32}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">Max 32 characters</p>
                </div>

                {/* Token Symbol */}
                <div className="space-y-2">
                  <Label htmlFor="symbol">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    placeholder="Ex: SOL"
                    maxLength={10}
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    className="bg-secondary/50"
                  />
                </div>

                {/* Decimals */}
                <div className="space-y-2">
                  <Label htmlFor="decimals" className="flex items-center gap-2">
                    Decimals *
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Usually 9 for Solana tokens</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="decimals"
                    type="number"
                    min="0"
                    max="18"
                    value={formData.decimals}
                    onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>

                {/* Supply */}
                <div className="space-y-2">
                  <Label htmlFor="supply">Supply *</Label>
                  <Input
                    id="supply"
                    type="text"
                    placeholder="1,000,000,000"
                    value={formData.supply}
                    onChange={(e) => setFormData({ ...formData, supply: e.target.value.replace(/\D/g, '') })}
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">Initial token supply</p>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo *</Label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-secondary/30 transition-all">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Token logo" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {logoPreview ? 'Change logo' : 'Upload token logo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Metadata URL */}
              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata URL (optional)</Label>
                <Input
                  id="metadata"
                  placeholder="https://..."
                  value={formData.metadataUrl}
                  onChange={(e) => setFormData({ ...formData, metadataUrl: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              {/* Authority Toggles */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium text-sm">Freeze Authority</p>
                    <p className="text-xs text-muted-foreground">Allow freezing token accounts</p>
                  </div>
                  <Switch
                    checked={formData.freezeAuthority}
                    onCheckedChange={(checked) => setFormData({ ...formData, freezeAuthority: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <div>
                    <p className="font-medium text-sm">Mint Authority</p>
                    <p className="text-xs text-muted-foreground">Keep ability to mint more</p>
                  </div>
                  <Switch
                    checked={formData.mintAuthority}
                    onCheckedChange={(checked) => setFormData({ ...formData, mintAuthority: checked })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full text-lg py-6 glow group">
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Create Token
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Fee: 0.05 SOL • Instant deployment
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenCreatorForm;