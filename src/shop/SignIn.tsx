import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Loader2 } from 'lucide-react';
import { type SyntheticEvent, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { post } from '@/lib/api';

interface SignInProps {
    onDone: () => void;
    // Shown above the form ("Sign in to keep your invite").
    lead?: string;
}

// Email → 6-digit code. The first sign-in makes the account; there are no passwords.
export function SignIn({ onDone, lead }: SignInProps) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const form = useRef<HTMLFormElement>(null);
    const emailId = useId();

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            if (step === 'email') {
                await post('/store/auth/request-code', { email });
                setStep('code');
            } else {
                await post('/store/auth/verify', {
                    email,
                    code,
                });
                onDone();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setCode('');
        } finally {
            setBusy(false);
        }
    };

    return (
        <form
            ref={form}
            onSubmit={(e) => {
                void submit(e);
            }}
            className="space-y-4"
        >
            {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
            {step === 'email' ? (
                <div className="space-y-1.5">
                    <label htmlFor={emailId} className="text-sm font-medium">
                        Your email
                    </label>
                    <Input
                        id={emailId}
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        placeholder="you@example.com"
                        className="h-10"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm">
                        We sent a 6-digit code to <b>{email}</b>.{' '}
                        <button
                            type="button"
                            className="text-primary underline underline-offset-2"
                            onClick={() => {
                                setStep('email');
                                setCode('');
                            }}
                        >
                            Change
                        </button>
                    </p>
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={code}
                        onChange={setCode}
                        onComplete={() => form.current?.requestSubmit()}
                        autoComplete="one-time-code"
                        aria-label="Sign-in code"
                        containerClassName="justify-center"
                    >
                        <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }, (_, i) => (
                                <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className="h-12 w-11 rounded-md border font-mono text-xl first:rounded-md last:rounded-md"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={busy || (step === 'code' && code.length < 6)}
            >
                {busy && <Loader2 className="animate-spin" />}
                {step === 'email' ? 'Email me a code' : 'Continue'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
                No password needed. Google sign-in is coming soon.
            </p>
        </form>
    );
}
