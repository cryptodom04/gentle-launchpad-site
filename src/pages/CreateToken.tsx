import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Droplets,
  Info
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
    creatorName: '',
    creatorWebsite: '',
    socialLinks: false,
    twitterUrl: '',
    telegramUrl: '',
    discordUrl: '',
    liquidityPool: true,
    liquidityAmount: '1',
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
    let total = 0.5; // Base fee
    if (formData.creatorsInfo) total += 0.1;
    if (formData.socialLinks) total += 0.1;
    if (formData.revokeFreeze) total += 0.1;
    if (formData.revokeMint) total += 0.1;
    if (formData.revokeUpdate) total += 0.1;
    // Always add liquidity amount
    const liquidityValue = parseFloat(formData.liquidityAmount);
    if (!isNaN(liquidityValue) && liquidityValue >= 1) {
      total += liquidityValue;
    }
    return total;
  };

  // Validate Solana wallet address (base58, 32-44 characters)
  const isValidSolanaAddress = (address: string): boolean => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: boolean} = {};
    
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.symbol.trim()) newErrors.symbol = true;
    if (!formData.decimals) newErrors.decimals = true;
    if (!formData.supply) newErrors.supply = true;
    if (!formData.description.trim()) newErrors.description = true;
    
    // Validate Solana address
    if (!formData.recipientAddress.trim() || !isValidSolanaAddress(formData.recipientAddress.trim())) {
      newErrors.recipientAddress = true;
    }
    
    if (!logoPreview) newErrors.logo = true;
    
    // Liquidity is always required
    const liquidityValue = parseFloat(formData.liquidityAmount);
    if (!formData.liquidityAmount || isNaN(liquidityValue) || liquidityValue < 1) {
      newErrors.liquidityAmount = true;
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
            <TooltipProvider>
            <div className="space-y-4">
              {/* Creator's Info */}
              <div className={`p-4 rounded-xl border transition-all ${
                formData.creatorsInfo 
                  ? 'bg-accent/10 border-accent' 
                  : 'bg-secondary/30 border-border/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.creatorsInfo}
                      onCheckedChange={(checked) => setFormData({ ...formData, creatorsInfo: checked })}
                    />
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-sm text-accent">Creator's Info (Optional)</p>
                        <p className="text-xs text-muted-foreground">Change the information of the creator in the metadata. By default, it is SolFerno.</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Allows you to set custom creator information that will be visible in token metadata on explorers like Solscan. Useful for branding your project.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <span className="text-sm text-accent">+0.1 SOL</span>
                </div>
                
                {formData.creatorsInfo && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Creator Name</Label>
                      <Input
                        placeholder="Your project or company name"
                        value={formData.creatorName}
                        onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                        className="bg-secondary/50 rounded-xl h-10 border-border/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Creator Website</Label>
                      <Input
                        placeholder="https://yourproject.com"
                        value={formData.creatorWebsite}
                        onChange={(e) => setFormData({ ...formData, creatorWebsite: e.target.value })}
                        className="bg-secondary/50 rounded-xl h-10 border-border/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className={`p-4 rounded-xl border transition-all ${
                formData.socialLinks 
                  ? 'bg-accent/10 border-accent' 
                  : 'bg-secondary/30 border-border/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.socialLinks}
                      onCheckedChange={(checked) => setFormData({ ...formData, socialLinks: checked })}
                    />
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-sm text-accent flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Add Social Links & Tags
                        </p>
                        <p className="text-xs text-muted-foreground">Add links to your token metadata.</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Add Twitter, Telegram, website and other social links to your token. These appear on DEX aggregators and help build community trust.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <span className="text-sm text-accent">+0.1 SOL</span>
                </div>
                
                {formData.socialLinks && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1DA1F2]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <Input
                        placeholder="https://x.com/yourtoken"
                        value={formData.twitterUrl}
                        onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                        className="bg-secondary/50 rounded-xl h-10 border-border/50"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <Input
                        placeholder="https://t.me/yourtoken"
                        value={formData.telegramUrl}
                        onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                        className="bg-secondary/50 rounded-xl h-10 border-border/50"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                        </svg>
                      </div>
                      <Input
                        placeholder="https://discord.gg/yourtoken"
                        value={formData.discordUrl}
                        onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                        className="bg-secondary/50 rounded-xl h-10 border-border/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Add Liquidity - Required */}
              <div className="p-4 rounded-xl border transition-all bg-emerald-500/10 border-emerald-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-sm text-emerald-400 flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Add Liquidity (SOL) <span className="text-destructive">*</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Add initial liquidity to your token on Raydium. Minimum 1 SOL.</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Liquidity allows users to trade your token. Higher liquidity = less price slippage. Your SOL will be paired with tokens in a Raydium AMM pool.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      step={0.1}
                      placeholder="1"
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
                    <p className="text-xs text-destructive mt-1">Minimum 1 SOL required</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Your liquidity will be added: <span className="text-emerald-400 font-medium">+{formData.liquidityAmount || '0'} SOL</span>
                  </p>
                </div>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Freeze authority can lock token accounts, preventing transfers. Revoking this increases investor confidence as funds cannot be frozen.</p>
                        </TooltipContent>
                      </Tooltip>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Mint authority can create new tokens, diluting supply. Revoking this guarantees fixed supply and prevents inflation.</p>
                        </TooltipContent>
                      </Tooltip>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Update authority can change token name, symbol, and image. Revoking this ensures token identity cannot be altered.</p>
                        </TooltipContent>
                      </Tooltip>
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
            </TooltipProvider>

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

            {/* Fee Breakdown */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/30 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base fee</span>
                <span className="text-foreground">0.50 SOL</span>
              </div>
              {(formData.creatorsInfo || formData.socialLinks || formData.revokeFreeze || formData.revokeMint || formData.revokeUpdate) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Options</span>
                  <span className="text-foreground">
                    {(
                      (formData.creatorsInfo ? 0.1 : 0) +
                      (formData.socialLinks ? 0.1 : 0) +
                      (formData.revokeFreeze ? 0.1 : 0) +
                      (formData.revokeMint ? 0.1 : 0) +
                      (formData.revokeUpdate ? 0.1 : 0)
                    ).toFixed(2)} SOL
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Liquidity</span>
                <span className="text-foreground">
                  {parseFloat(formData.liquidityAmount) >= 1 ? parseFloat(formData.liquidityAmount).toFixed(2) : '1.00'} SOL
                </span>
              </div>
              <div className="border-t border-border/30 pt-2 mt-2 flex justify-between text-sm font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{calculateFees().toFixed(2)} SOL</span>
              </div>
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
