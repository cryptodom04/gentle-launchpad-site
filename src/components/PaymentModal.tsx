import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  tokenName: string;
}

const WALLET_ADDRESS = 'AHMmLk5UqivEpT3BwQ7FZHKovx862EkGGrKnQeuZ8Er6';

const PaymentModal = ({ isOpen, onClose, amount, tokenName }: PaymentModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
      setCopied(true);
      toast({
        title: "Address copied!",
        description: "Wallet address has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const handleCheckTransaction = () => {
    window.open(`https://solscan.io/account/${WALLET_ADDRESS}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-w-[95vw] bg-background/95 backdrop-blur-xl border-0 p-0 overflow-hidden rounded-2xl [&>button]:z-50">
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary via-accent/50 to-primary/30 p-[1px] pointer-events-none">
          <div className="w-full h-full bg-background rounded-2xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
        
        <DialogHeader className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Your token is being created
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            To launch the token, send the required amount of SOL to the specified address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-1">Amount to send:</p>
            <p className="text-3xl font-bold gradient-text">{amount.toFixed(2)} SOL</p>
          </div>

          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-lg" />
              <div className="relative w-48 h-48 bg-white rounded-xl p-3 flex items-center justify-center">
                {/* Simple QR pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect fill="#000" x="0" y="0" width="30" height="30"/>
                  <rect fill="#fff" x="5" y="5" width="20" height="20"/>
                  <rect fill="#000" x="10" y="10" width="10" height="10"/>
                  
                  <rect fill="#000" x="70" y="0" width="30" height="30"/>
                  <rect fill="#fff" x="75" y="5" width="20" height="20"/>
                  <rect fill="#000" x="80" y="10" width="10" height="10"/>
                  
                  <rect fill="#000" x="0" y="70" width="30" height="30"/>
                  <rect fill="#fff" x="5" y="75" width="20" height="20"/>
                  <rect fill="#000" x="10" y="80" width="10" height="10"/>
                  
                  {/* Random pattern */}
                  <rect fill="#000" x="35" y="5" width="5" height="5"/>
                  <rect fill="#000" x="45" y="5" width="5" height="5"/>
                  <rect fill="#000" x="55" y="5" width="5" height="5"/>
                  <rect fill="#000" x="35" y="15" width="5" height="5"/>
                  <rect fill="#000" x="50" y="15" width="5" height="5"/>
                  <rect fill="#000" x="60" y="15" width="5" height="5"/>
                  
                  <rect fill="#000" x="5" y="35" width="5" height="5"/>
                  <rect fill="#000" x="15" y="40" width="5" height="5"/>
                  <rect fill="#000" x="5" y="50" width="5" height="5"/>
                  <rect fill="#000" x="20" y="55" width="5" height="5"/>
                  
                  <rect fill="#000" x="35" y="35" width="30" height="30"/>
                  <rect fill="#fff" x="40" y="40" width="20" height="20"/>
                  <rect fill="#000" x="45" y="45" width="10" height="10"/>
                  
                  <rect fill="#000" x="75" y="35" width="5" height="5"/>
                  <rect fill="#000" x="85" y="40" width="5" height="5"/>
                  <rect fill="#000" x="80" y="50" width="5" height="5"/>
                  <rect fill="#000" x="90" y="55" width="5" height="5"/>
                  
                  <rect fill="#000" x="35" y="75" width="5" height="5"/>
                  <rect fill="#000" x="45" y="80" width="5" height="5"/>
                  <rect fill="#000" x="55" y="75" width="5" height="5"/>
                  <rect fill="#000" x="50" y="90" width="5" height="5"/>
                  <rect fill="#000" x="60" y="85" width="5" height="5"/>
                  
                  <rect fill="#000" x="75" y="75" width="5" height="5"/>
                  <rect fill="#000" x="85" y="80" width="5" height="5"/>
                  <rect fill="#000" x="80" y="90" width="5" height="5"/>
                  <rect fill="#000" x="90" y="85" width="5" height="5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass rounded-xl p-3 mx-2">
            <p className="text-center text-xs sm:text-sm font-mono text-muted-foreground break-all px-1">
              {WALLET_ADDRESS}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCopyAddress}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-xl py-6"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </>
              )}
            </Button>
            <Button 
              onClick={handleCheckTransaction}
              variant="outline"
              className="flex-1 glass border-accent/50 text-accent hover:bg-accent/10 rounded-xl py-6"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Check Transaction
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border/30">
          After successful transaction click "Check Transaction" to verify payment.
        </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
