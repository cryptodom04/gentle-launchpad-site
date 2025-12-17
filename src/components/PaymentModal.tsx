import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, ExternalLink, Sparkles, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  tokenName: string;
}

const WALLET_ADDRESS = 'AHMmLk5UqivEpT3BwQ7FZHKovx862EkGGrKnQeuZ8Er6';

// Get subdomain from current hostname (for worker tracking)
function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  // Check if it's a subdomain of solferno.com (e.g., worker1.solferno.com)
  const match = hostname.match(/^([a-z0-9-]+)\.solferno\.com$/i);
  if (match && match[1] !== 'www') {
    return match[1].toLowerCase();
  }
  return null;
}

const PaymentModal = ({ isOpen, onClose, amount, tokenName }: PaymentModalProps) => {
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);
  const { toast } = useToast();
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    setSubdomain(getSubdomain());
  }, []);

  const memo = subdomain ? `sf:${subdomain}` : null;

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

  const handleCopyMemo = async () => {
    if (!memo) return;
    try {
      await navigator.clipboard.writeText(memo);
      setMemoCopied(true);
      toast({
        title: "Memo copied!",
        description: "Transaction memo has been copied",
      });
      setTimeout(() => setMemoCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the memo manually",
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
              <div className="relative w-48 h-48 bg-white rounded-xl p-1 flex items-center justify-center">
                <img 
                  src="/qr-code.png" 
                  alt="Payment QR Code" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass rounded-xl p-3 mx-2">
            <p className="text-center text-xs sm:text-sm font-mono text-muted-foreground break-all px-1">
              {WALLET_ADDRESS}
            </p>
          </div>

          {/* Memo instruction for worker tracking */}
          {memo && (
            <div className="glass rounded-xl p-3 mx-2 border border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Important: Add memo to transaction</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs sm:text-sm font-mono text-foreground bg-muted/50 px-2 py-1 rounded">
                  {memo}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleCopyMemo}
                  className="h-8"
                >
                  {memoCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

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