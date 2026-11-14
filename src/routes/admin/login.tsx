import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { FormField } from '@/admin/kit/form';
import { LoginCrown } from '@/admin/shell/login-crown';
import { ToranSeal } from '@/components/brand/toran-seal';
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
import { fetchRegion } from '@/server-fns/region';

export const Route = createFileRoute('/admin/login')({
    validateSearch: z.object({ next: z.string().optional() }),
    // Which traditions the crown leads with: the visitor's country, read from the request.
    loader: () => fetchRegion(),
    component: Login,
});

function Login() {
    const { next } = Route.useSearch();
    const { country } = Route.useLoaderData();
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

    // Enter signs in wherever focus is (e.g. still on the Dev mail link after copying the code),
    // and coming back to the tab puts the cursor back in the field.
    useEffect(() => {
        const field = () =>
            formRef.current?.querySelector<HTMLInputElement>(
                step === 'code' ? 'input[name="code"]' : 'input[name="email"]',
            );
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Enter' || e.isComposing) return;
            const form = formRef.current;
            if (!form || (e.target instanceof Node && form.contains(e.target))) return;
            e.preventDefault();
            // Respect the button's rules (busy, or fewer than six digits).
            if (form.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled) return;
            form.requestSubmit();
        };
        const onFocus = () => {
            const el = field();
            if (el && document.activeElement !== el) el.focus();
        };
        document.addEventListener('keydown', onKey);
        window.addEventListener('focus', onFocus);
        return () => {
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('focus', onFocus);
        };
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
        <div className="grid min-h-svh grid-rows-[auto_1fr] bg-background lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1">
            <aside className="grain relative hidden overflow-hidden bg-night p-12 text-ivory lg:flex lg:flex-col">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(195,154,78,0.28),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(110,26,46,0.7),transparent_55%)]" />
                <LoginCrown country={country} />
                <div className="relative mt-auto max-w-md space-y-5">
                    <ToranSeal className="size-36 text-gold-bright drop-shadow-[0_8px_30px_rgba(195,154,78,0.25)]" />
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
            {/* Phones: the garland and greeting crown the page in a short dark band. */}
            <header className="grain relative overflow-hidden bg-night px-6 pb-7 text-ivory lg:hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(195,154,78,0.28),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(110,26,46,0.7),transparent_60%)]" />
                <LoginCrown compact country={country} />
            </header>
            <main className="relative flex items-center justify-center overflow-hidden px-4 py-12">
                {/* Watermark seal: 75% on screen, 25% bleeding off the right edge, turning slowly. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute end-0 top-1/2 size-[min(115vh,860px)] translate-x-1/4 -translate-y-1/2 select-none rtl:-translate-x-1/4"
                >
                    <ToranSeal
                        title=""
                        className="size-full animate-[spin_90s_linear_infinite] text-primary opacity-[0.06] motion-reduce:animate-none"
                    />
                </div>
                <Card className="relative w-full max-w-sm border-none bg-transparent shadow-none ring-0">
                    <CardHeader className="gap-2 px-0">
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
