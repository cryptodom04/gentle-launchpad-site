import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Upload, Rocket, Sparkles, Check, Copy, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TokenCreatorForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Connect Wallet",
      description: "Please connect your wallet to create a token",
    });
  };

  return (
    <section id="create" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 aurora-bg opacity-50" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text */}
          <div className="reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Token Creator</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Design Your
              <br />
              <span className="gradient-text">Perfect Token</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Customize every aspect of your Solana token. From supply to authorities — you have complete control.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                'Instant deployment on Solana mainnet',
                'Full metadata support with images',
                'Configurable mint & freeze authorities',
                'Compatible with all major wallets',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="reveal-right">
            <div className="glass-strong rounded-3xl p-8 gradient-border relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[100px]" />
              
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                {/* Logo Upload */}
                <div className="flex justify-center mb-8">
                  <label className="cursor-pointer group">
                    <div className={`w-28 h-28 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden ${
                      logoPreview ? 'border-accent' : 'border-border hover:border-primary/50'
                    }`}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Token logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs text-muted-foreground">Upload Logo</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>

                {/* Token Name & Symbol */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Token Name</Label>
                    <Input
                      id="name"
                      placeholder="My Token"
                      maxLength={32}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-sm font-medium">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="TKN"
                      maxLength={10}
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Decimals Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Decimals</Label>
                    <span className="text-2xl font-bold gradient-text">{formData.decimals}</span>
                  </div>
                  <Slider
                    value={[formData.decimals]}
                    onValueChange={([value]) => setFormData({ ...formData, decimals: value })}
                    max={18}
                    min={0}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>9 (default)</span>
                    <span>18</span>
                  </div>
                </div>

                {/* Supply */}
                <div className="space-y-2">
                  <Label htmlFor="supply" className="text-sm font-medium">Total Supply</Label>
                  <div className="relative">
                    <Input
                      id="supply"
                      type="text"
                      placeholder="1,000,000,000"
                      value={Number(formData.supply).toLocaleString()}
                      onChange={(e) => setFormData({ ...formData, supply: e.target.value.replace(/\D/g, '') })}
                      className="bg-secondary/50 border-border/50 rounded-xl h-12 pr-12 focus:ring-2 focus:ring-primary/50"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.supply);
                        toast({ title: "Copied!", description: "Supply copied to clipboard" });
                      }}
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Authority Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div>
                      <p className="font-medium text-sm">Freeze</p>
                      <p className="text-xs text-muted-foreground">Authority</p>
                    </div>
                    <Switch
                      checked={formData.freezeAuthority}
                      onCheckedChange={(checked) => setFormData({ ...formData, freezeAuthority: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div>
                      <p className="font-medium text-sm">Mint</p>
                      <p className="text-xs text-muted-foreground">Authority</p>
                    </div>
                    <Switch
                      checked={formData.mintAuthority}
                      onCheckedChange={(checked) => setFormData({ ...formData, mintAuthority: checked })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg py-7 rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all duration-300 glow-multi font-semibold group"
                >
                  <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Create Token
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Creation fee: <span className="text-foreground font-medium">0.05 SOL</span> • Instant deployment
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenCreatorForm;