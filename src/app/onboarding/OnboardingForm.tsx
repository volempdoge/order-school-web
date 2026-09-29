"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as fbq from "@/lib/tracker";

// Bump when the consent wording or the privacy policy changes
const PRIVACY_POLICY_VERSION = "2026-09-29";

function ConsentCheckbox({
  id,
  checked,
  onChange,
  onBlur,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  onBlur: () => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary-strong"
        />
        <label htmlFor={id} className="cursor-pointer type-small">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 type-small text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function OnboardingForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      role: "",
      fullName: "",
      school: "",
      grade: "",
      module: "",
      telegram: "",
      phone: "",
      howDidYouHear: "",
      consent: false,
      guardianConsent: false,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        const SCRIPT_URL =
          "https://script.google.com/macros/s/AKfycbzlmnbPihX9FPIcVju8YjOHzi1c7dM3n4f_Yg8PAFIK1ixg0RFW087hcxHTKD_wPjCmBA/exec";

        // `no-cors`: the response is opaque, so there is nothing to read from it
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...value,
            // Only a student confirms the guardian's consent; a parent consents themselves
            guardianConsent: value.role === "student" ? value.guardianConsent : null,
            consentAt: new Date().toISOString(),
            privacyPolicyVersion: PRIVACY_POLICY_VERSION,
          }),
        });

        fbq.event("CompleteRegistration");

        setShowSuccess(true);

        form.reset();
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Під час надсилання форми сталася помилка. Будь ласка, спробуйте ще раз.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <>
      <section className="flex min-h-screen items-center justify-center p-4 pb-16">
        <div className="mt-24 w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl md:mt-48 md:p-12">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <FieldSet>
              <FieldGroup>
                <FieldLegend className="mb-0">
                  <h1 className="type-h2">Хочу на Гурток політичних студій</h1>
                </FieldLegend>
                <FieldDescription className="type-body text-muted-foreground">
                  Заповніть цю форму, якщо бажаєте дізнатися більше про гурток або зареєструватись. Ми
                  звʼяжемось з вами протягом одного-двох днів, щоб уточнити деталі, відповісти на ваші
                  запитання та продовжити реєстрацію на гурток.
                </FieldDescription>

                <div className="mt-6 space-y-6">
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Електронна пошта є обовʼязковою";
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          return "Введіть коректну адресу електронної пошти";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Електронна пошта <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="example@gmail.com"
                          type="email"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="role"
                    validators={{
                      onChange: ({ value }) => (!value ? "Оберіть, хто ви" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel>
                          Хто ви <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <RadioGroup
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="parent" id="parent" />
                            <Label htmlFor="parent" className="cursor-pointer">
                              Батько/Мати
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="student" id="student" />
                            <Label htmlFor="student" className="cursor-pointer">
                              Школяр
                            </Label>
                          </div>
                        </RadioGroup>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="fullName"
                    validators={{
                      onChange: ({ value }) => (!value ? "Прізвище та імʼя є обовʼязковими" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Ваше прізвище та імʼя <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Дьюї Джон"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="school"
                    validators={{
                      onChange: ({ value }) => (!value ? "Назва школи є обовʼязковою" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Школа, у якій навчається ваша дитина (або ви, якщо ви школяр){" "}
                          <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Назва школи"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="grade"
                    validators={{
                      onChange: ({ value }) => (!value ? "Оберіть клас" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Клас <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger id={field.name} className="bg-white">
                            <SelectValue placeholder="Оберіть клас" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="11">11</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="module"
                    validators={{
                      onChange: ({ value }) => (!value ? "Оберіть модуль" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Який модуль вас цікавить? <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger id={field.name} className="bg-white">
                            <SelectValue placeholder="Оберіть модуль" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intro">Вступ</SelectItem>
                            <SelectItem value="Міжнародне право">Міжнародне право</SelectItem>
                            <SelectItem value="Війна, торг, правила">Війна, торг, правила</SelectItem>
                            <SelectItem value="Політичні режими">Політичні режими</SelectItem>
                            <SelectItem value="Корупція та як політики (не)можуть на неї впливати">
                              Корупція та як політики (не)можуть на неї впливати
                            </SelectItem>
                            <SelectItem value="Весь курс">Весь курс</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="telegram"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Telegram є обовʼязковим";
                        if (!value.startsWith("@") && !value.startsWith("+")) {
                          return "Введіть username (@username) або номер телефону";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Telegram для звʼязку з вами <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="@username"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="phone"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Номер телефону є обовʼязковим";
                        if (!/^\+?[\d\s\-()]+$/.test(value)) {
                          return "Введіть коректний номер телефону";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Ваш номер телефону <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="+380 XX XXX XX XX"
                          type="tel"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>

                  <form.Field
                    name="howDidYouHear"
                    validators={{
                      onChange: ({ value }) => (!value ? "Це поле є обовʼязковим" : undefined),
                    }}
                  >
                    {(field) => (
                      <FieldGroup>
                        <FieldLabel htmlFor={field.name}>
                          Як ви дізналися про курс? <span className="text-primary-strong">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="TikTok, Instagram, від друзів…"
                          className="bg-white"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 type-small text-destructive">{field.state.meta.errors[0]}</p>
                        )}
                      </FieldGroup>
                    )}
                  </form.Field>
                  <form.Field
                    name="consent"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? "Без згоди на обробку персональних даних ми не можемо прийняти заявку"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <form.Subscribe selector={(state) => state.values.role}>
                        {(role) => (
                          <ConsentCheckbox
                            id={field.name}
                            checked={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            error={field.state.meta.errors[0] as string | undefined}
                          >
                            {role === "parent"
                              ? "Я є батьком/матірʼю або іншим законним представником дитини і даю згоду на обробку моїх персональних даних та персональних даних дитини, зазначених у формі, відповідно до "
                              : "Я даю згоду на обробку моїх персональних даних, зазначених у формі, відповідно до "}
                            <Link
                              href="/privacy"
                              target="_blank"
                              className="font-bold text-primary-strong underline underline-offset-2"
                            >
                              Політики конфіденційності
                            </Link>
                            . <span className="text-primary-strong">*</span>
                          </ConsentCheckbox>
                        )}
                      </form.Subscribe>
                    )}
                  </form.Field>

                  <form.Subscribe selector={(state) => state.values.role}>
                    {(role) =>
                      role === "student" && (
                        <form.Field
                          name="guardianConsent"
                          validators={{
                            onChangeListenTo: ["role"],
                            onChange: ({ value, fieldApi }) =>
                              fieldApi.form.getFieldValue("role") === "student" && !value
                                ? "Для неповнолітніх учасників потрібна згода батьків або законних представників"
                                : undefined,
                          }}
                        >
                          {(field) => (
                            <ConsentCheckbox
                              id={field.name}
                              checked={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              error={field.state.meta.errors[0] as string | undefined}
                            >
                              Мої батьки або інші законні представники ознайомлені з Політикою
                              конфіденційності та погоджуються на передачу моїх даних. Якщо мені ще не
                              виповнилося 14 років, форму заповнюють батьки.{" "}
                              <span className="text-primary-strong">*</span>
                            </ConsentCheckbox>
                          )}
                        </form.Field>
                      )
                    }
                  </form.Subscribe>
                </div>

                <div className="mt-8">
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Надсилання…" : "Надіслати форму"}
                  </Button>
                </div>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="success-title"
              className="w-full max-w-md rounded-lg bg-card p-8 text-center shadow-xl md:p-12"
            >
              <div className="mb-6">
                <svg
                  aria-hidden
                  className="mx-auto mb-4 h-16 w-16 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 id="success-title" className="mb-4 type-h2">
                  Форму успішно надіслано!
                </h2>
                <p className="type-body text-muted-foreground">
                  Дякуємо за звернення! Ми звʼяжемось з вами протягом одного-двох днів, щоб уточнити деталі.
                </p>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/">На головну</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
