import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  Zap, 
  ArrowLeft, 
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Shield,
  Coins,
  FileEdit,
  Droplets
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import PaymentModal from '@/components/PaymentModal';

const CreateToken = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '9',
    supply: '1000000',
    description: '',
    recipientAddress: '',
    creatorsInfo: false,
    socialLinks: false,
    liquidityPool: false,
    liquidityAmount: '',
    revokeFreeze: true,
    revokeMint: false,
    revokeUpdate: false,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
        clearError('logo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate total fees
  const calculateFees = () => {
    let total = 1.25; // Base fee
    if (formData.creatorsInfo) total += 0.1;
    if (formData.socialLinks) total += 0.1;
    if (formData.revokeFreeze) total += 0.1;
    if (formData.revokeMint) total += 0.1;
    if (formData.revokeUpdate) total += 0.1;
    if (formData.liquidityPool && formData.liquidityAmount) {
      total += parseFloat(formData.liquidityAmount) || 0;
    }
    return total;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: boolean} = {};
    
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.symbol.trim()) newErrors.symbol = true;
    if (!formData.decimals) newErrors.decimals = true;
    if (!formData.supply) newErrors.supply = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (!formData.recipientAddress.trim()) newErrors.recipientAddress = true;
    if (!logoPreview) newErrors.logo = true;
    if (formData.liquidityPool) {
      const liquidityValue = parseFloat(formData.liquidityAmount);
      if (!formData.liquidityAmount || isNaN(liquidityValue) || liquidityValue < 2) {
        newErrors.liquidityAmount = true;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields highlighted in red",
        variant: "destructive",
      });
      return;
    }
    
    setIsPaymentModalOpen(true);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background noise">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Token Creator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Create Your <span className="gradient-text">Solana Token</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Fill in the details below to launch your token on Solana mainnet
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Token Name & Symbol */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Token Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Trump Coin"
                  maxLength={32}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    clearError('name');
                  }}
                  className={`bg-secondary/50 rounded-xl h-12 ${errors.name ? 'border-2 border-destructive' : 'border-border/50'}`}
                />
                <p className="text-xs text-muted-foreground">Max 32 characters in your name</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol" className="text-sm font-medium">
                  Token Symbol <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="symbol"
                  placeholder="Ex: SOL"
                  maxLength={10}
                  value={formData.symbol}
                  onChange={(e) => {
                    setFormData({ ...formData, symbol: e.target.value.toUpperCase() });
                    clearError('symbol');
                  }}
                  className={`bg-secondary/50 rounded-xl h-12 ${errors.symbol ? 'border-2 border-destructive' : 'border-border/50'}`}
                />
              </div>
            </div>

            {/* Decimals & Supply */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="decimals" className="text-sm font-medium">
                  Decimals <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="decimals"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.decimals}
                  onChange={(e) => {
                    setFormData({ ...formData, decimals: e.target.value });
                    clearError('decimals');
                  }}
                  className={`bg-secondary/50 rounded-xl h-12 ${errors.decimals ? 'border-2 border-destructive' : 'border-border/50'}`}
                />
                <p className="text-xs text-muted-foreground">Change the number of decimals for your token</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply" className="text-sm font-medium">
                  Supply <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supply"
                  type="text"
                  placeholder="1000000"
                  value={formData.supply}
                  onChange={(e) => {
                    setFormData({ ...formData, supply: e.target.value.replace(/\D/g, '') });
                    clearError('supply');
                  }}
                  className={`bg-secondary/50 rounded-xl h-12 ${errors.supply ? 'border-2 border-destructive' : 'border-border/50'}`}
                />
                <p className="text-xs text-muted-foreground">The initial number of available tokens that will be created in your wallet</p>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Logo <span className="text-destructive">*</span>
                </Label>
                <label 
                  className={`block cursor-pointer`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                    dragActive ? 'border-accent bg-accent/10' : errors.logo ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/50'
                  } ${logoPreview ? 'border-accent' : ''}`}>
                    {logoPreview ? (
                      <div className="flex justify-center">
                        <img src={logoPreview} alt="Token logo" className="w-24 h-24 object-cover rounded-xl" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Drag and drop here to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">.png, .jpg 1000x1000 px</p>
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
                <p className="text-xs text-accent">Add logo for your token or use AI to Generate one for you!</p>
              </div>
              
              {/* AI Logo Generation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Generate Personalized AI Logo 
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-accent/20 text-accent font-medium">COMING SOON</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 bg-secondary/20 opacity-50">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto text-accent mb-2" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">(At just 0.05 SOL)</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Here you can describe your token"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  clearError('description');
                }}
                className={`bg-secondary/50 rounded-xl min-h-[120px] resize-none ${errors.description ? 'border-2 border-destructive' : 'border-border/50'}`}
              />
            </div>

            {/* Optional Features */}
            <div className="space-y-4">
              {/* Creator's Info */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.creatorsInfo}
                    onCheckedChange={(checked) => setFormData({ ...formData, creatorsInfo: checked })}
                  />
                  <div>
                    <p className="font-medium text-sm text-accent">Creator's Info (Optional)</p>
                    <p className="text-xs text-muted-foreground">Change the information of the creator in the metadata. By default, it is Luna Launch.</p>
                  </div>
                </div>
                <span className="text-sm text-accent">+0.1 SOL</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.socialLinks}
                    onCheckedChange={(checked) => setFormData({ ...formData, socialLinks: checked })}
                  />
                  <div>
                    <p className="font-medium text-sm text-accent flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Add Social Links & Tags
                    </p>
                    <p className="text-xs text-muted-foreground">Add links to your token metadata.</p>
                  </div>
                </div>
                <span className="text-sm text-accent">+0.1 SOL</span>
              </div>

              {/* Add Liquidity */}
              <div className={`p-4 rounded-xl border transition-all ${
                formData.liquidityPool 
                  ? 'bg-emerald-500/10 border-emerald-500' 
                  : 'bg-secondary/30 border-border/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.liquidityPool}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, liquidityPool: checked, liquidityAmount: checked ? '2' : '' });
                        if (!checked) clearError('liquidityAmount');
                      }}
                    />
                    <div>
                      <p className="font-medium text-sm text-emerald-400 flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Add Liquidity (SOL)
                      </p>
                      <p className="text-xs text-muted-foreground">Add initial liquidity to your token on Raydium. Minimum 2 SOL.</p>
                    </div>
                  </div>
                </div>
                
                {formData.liquidityPool && (
                  <div className="mt-4 pl-12">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={2}
                        step={0.1}
                        placeholder="2"
                        value={formData.liquidityAmount}
                        onChange={(e) => {
                          setFormData({ ...formData, liquidityAmount: e.target.value });
                          clearError('liquidityAmount');
                        }}
                        className={`bg-secondary/50 rounded-xl h-10 w-32 ${errors.liquidityAmount ? 'border-2 border-destructive' : 'border-border/50'}`}
                      />
                      <span className="text-sm font-medium text-emerald-400">SOL</span>
                    </div>
                    {errors.liquidityAmount && (
                      <p className="text-xs text-destructive mt-1">Minimum 2 SOL required</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Your liquidity will be added: <span className="text-emerald-400 font-medium">+{formData.liquidityAmount || '0'} SOL</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Revoke Authorities */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Revoke Authorities (Investor's Booster)</h3>
                <p className="text-xs text-muted-foreground">
                  Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Revoke Freeze */}
                <div className={`p-4 rounded-xl border transition-all ${
                  formData.revokeFreeze 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-secondary/30 border-border/30'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-primary">Revoke Freeze</span>
                    </div>
                    <Checkbox
                      checked={formData.revokeFreeze}
                      onCheckedChange={(checked) => setFormData({ ...formData, revokeFreeze: checked as boolean })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    No one will be able to freeze holders' token accounts anymore
                  </p>
                  <p className="text-xs text-accent">+0.1 SOL</p>
                </div>

                {/* Revoke Mint */}
                <div className={`p-4 rounded-xl border transition-all ${
                  formData.revokeMint 
                    ? 'bg-accent/10 border-accent' 
                    : 'bg-secondary/30 border-border/30'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-accent" />
                      <span className="font-medium text-sm text-accent">Revoke Mint</span>
                    </div>
                    <Checkbox
                      checked={formData.revokeMint}
                      onCheckedChange={(checked) => setFormData({ ...formData, revokeMint: checked as boolean })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    No one will be able to create more tokens anymore
                  </p>
                  <p className="text-xs text-accent">+0.1 SOL</p>
                </div>

                {/* Revoke Update */}
                <div className={`p-4 rounded-xl border transition-all ${
                  formData.revokeUpdate 
                    ? 'bg-blue-500/10 border-blue-500' 
                    : 'bg-secondary/30 border-border/30'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-sm text-blue-400">Revoke Update</span>
                    </div>
                    <Checkbox
                      checked={formData.revokeUpdate}
                      onCheckedChange={(checked) => setFormData({ ...formData, revokeUpdate: checked as boolean })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    No one will be able to modify token metadata anymore
                  </p>
                  <p className="text-xs text-accent">+0.1 SOL</p>
                </div>
              </div>
            </div>

            {/* Token Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-sm font-medium">
                Enter token recipient <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipient"
                placeholder="Enter address who will be the receiver of the token (owner)"
                value={formData.recipientAddress}
                onChange={(e) => {
                  setFormData({ ...formData, recipientAddress: e.target.value });
                  clearError('recipientAddress');
                }}
                className={`bg-secondary/50 rounded-xl h-12 ${errors.recipientAddress ? 'border-2 border-destructive' : 'border-border/50'}`}
              />
            </div>

            {/* Submit Button */}
            <div className="text-center space-y-4 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full max-w-md text-lg py-7 rounded-full bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 transition-all duration-300 glow-multi font-semibold group"
              >
                <Zap className="w-5 h-5 mr-2" />
                Launch Token
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Total Fees: <span className="line-through text-muted-foreground/50">1.9 SOL</span>{' '}
                <span className="text-foreground font-bold">{calculateFees().toFixed(2)} SOL</span>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={calculateFees()}
        tokenName={formData.name || 'Your Token'}
      />
    </div>
  );
};

export default CreateToken;
