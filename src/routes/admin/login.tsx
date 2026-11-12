import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { FormField } from '@/admin/kit/form';
import { BrandMark } from '@/admin/shell/app-sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ApiError, post } from '@/lib/api';
import { formString } from '@/motion/hooks';

export const Route = createFileRoute('/admin/login')({
    validateSearch: z.object({ next: z.string().optional() }),
    component: Login,
});

function Login() {
    const { next } = Route.useSearch();
    const navigate = useNavigate();
    const client = useQueryClient();
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // Move focus to the code boxes only after a code was requested (an explicit step change).
    useEffect(() => {
        if (step === 'code')
            formRef.current?.querySelector<HTMLInputElement>('input[name="code"]')?.focus();
    }, [step]);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
            if (step === 'email') {
                const value = formString(form, 'email');
                await post('/auth/request-code', { email: value });
                setEmail(value);
                setCode('');
                setStep('code');
            } else {
                await post('/auth/verify', {
                    email,
                    code,
                });
                // The shell asked for /auth/me while signed out; drop that answer before entering.
                client.removeQueries({ queryKey: ['me'] });
                await navigate({ to: next?.startsWith('/admin') ? next : '/admin' });
            }
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
            <aside className="grain relative hidden overflow-hidden bg-night p-12 text-ivory lg:flex lg:flex-col">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(195,154,78,0.28),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(110,26,46,0.7),transparent_55%)]" />
                <div className="relative flex items-center gap-3">
                    <BrandMark />
                    <span className="font-display text-2xl">Toran</span>
                    <span className="text-[10px] tracking-[0.3em] text-gold-bright/80 uppercase">
                        Studio
                    </span>
                </div>
                <div className="relative mt-auto max-w-md space-y-5">
                    <div className="hairline w-24 text-gold" />
                    <p className="font-display text-4xl leading-tight text-balance">
                        Every invitation begins at the doorway.
                    </p>
                    <p className="text-sm leading-relaxed text-ivory/60">
                        Orders, invitations, guests and payments for the studio, all in one calm
                        place.
                    </p>
                </div>
            </aside>
            <main className="flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-sm border-none bg-transparent shadow-none">
                    <CardHeader className="gap-2 px-0">
                        <div className="mb-4 lg:hidden">
                            <BrandMark />
                        </div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            {step === 'email' ? 'Sign in to Toran Studio' : 'Check your inbox'}
                        </CardTitle>
                        <CardDescription>
                            {step === 'email' ? (
                                'We’ll email you a one-time code. No passwords.'
                            ) : (
                                <>
                                    We sent a 6-digit code to{' '}
                                    <span className="font-medium text-foreground">{email}</span>.
                                </>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <form ref={formRef} onSubmit={(e) => void submit(e)}>
                            <FieldGroup className="gap-4">
                                {step === 'email' ? (
                                    <FormField key="email" label="Work email">
                                        {(id) => (
                                            <Input
                                                id={id}
                                                name="email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                placeholder="you@therigi.co"
                                                className="h-10"
                                            />
                                        )}
                                    </FormField>
                                ) : (
                                    <FormField key="code" label="One-time code">
                                        {(id) => (
                                            <InputOTP
                                                id={id}
                                                name="code"
                                                maxLength={6}
                                                pattern={REGEXP_ONLY_DIGITS}
                                                value={code}
                                                onChange={setCode}
                                                onComplete={() => {
                                                    // Six digits in: sign in without an extra click.
                                                    formRef.current?.requestSubmit();
                                                }}
                                                required
                                                autoComplete="one-time-code"
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
                                        )}
                                    </FormField>
                                )}
                                {error && (
                                    <Alert variant="destructive" className="py-2.5">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={busy || (step === 'code' && code.length < 6)}
                                >
                                    {busy ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        step === 'email' && <Mail />
                                    )}
                                    {step === 'email' ? 'Send code' : 'Sign in'}
                                </Button>
                                {step === 'code' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground"
                                        onClick={() => {
                                            setError(null);
                                            setStep('email');
                                        }}
                                    >
                                        <ArrowLeft className="rtl:rotate-180" /> Use a different
                                        email
                                    </Button>
                                )}
                            </FieldGroup>
                        </form>
                    </CardContent>
                    {import.meta.env.DEV && (
                        <CardFooter className="px-0 text-xs text-muted-foreground">
                            <p>
                                Developing locally? Your code is in{' '}
                                <a
                                    href="/dev-mail"
                                    target="_blank"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Dev mail
                                </a>
                                .
                            </p>
                        </CardFooter>
                    )}
                </Card>
            </main>
        </div>
    );
}
