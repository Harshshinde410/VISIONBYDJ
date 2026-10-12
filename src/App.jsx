
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coins,
  IndianRupee,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULTS = {
  monthly: 10000,
  rate: 12,
  years: 10,
  stepUp: 0,
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const compactMoney = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return money(value);
};

function calculateSip(monthly, annualRate, years, stepUp = 0) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  let invested = 0;
  let balance = 0;

  const data = [{ year: "Start", invested: 0, value: 0 }];

  for (let month = 1; month <= months; month++) {
    const currentYear = Math.floor((month - 1) / 12);
    const contribution =
      monthly * Math.pow(1 + stepUp / 100, currentYear);

    invested += contribution;
    balance = (balance + contribution) * (1 + monthlyRate);

    if (month % 12 === 0) {
      data.push({
        year: `Year ${month / 12}`,
        invested: Math.round(invested),
        value: Math.round(balance),
      });
    }
  }

  return {
    invested,
    value: balance,
    returns: balance - invested,
    data,
  };
}

/* BRAND */

function Brand({ small = false }) {
  return (
    <a
      className={`brand ${small ? "brand-small" : ""}`}
      href="#home"
      aria-label="VISIONBYDJ home"
    >
      <span className="brand-mark">
        <img
          src="/visionbydj-logo.png"
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="brand-fallback">V</span>
      </span>

      <span className="brand-word">
        <span className="brand-name">
          VISION<span>BYDJ</span>
        </span>
        <small>WEALTH PLANNING</small>
      </span>
    </a>
  );
}

/* INTRO ANIMATION */

function IntroOverlay({ onFinish }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      onFinish();
      return undefined;
    }

    const leaveTimer = window.setTimeout(
      () => setLeaving(true),
      1700
    );

    const finishTimer = window.setTimeout(onFinish, 2250);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`intro-overlay ${
        leaving ? "intro-leaving" : ""
      }`}
    >
      <div className="intro-glow" />

      <div className="intro-content">
        <div className="intro-logo">
          <img
            src="/visionbydj-logo.png"
            alt="VISIONBYDJ"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>V</span>
        </div>

        <div className="intro-line" />
        <p>YOUR FUTURE, IN FOCUS.</p>
      </div>
    </div>
  );
}

/* HEADER */

function Header({ dark, setDark }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />

        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#calculator">
            Calculator
          </a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQs</a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label={`Switch to ${
              dark ? "light" : "dark"
            } theme`}
            title={`Switch to ${
              dark ? "light" : "dark"
            } theme`}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <a className="btn btn-primary header-cta" href="#calculator">
            Plan your SIP <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

/* INPUT FIELDS */

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}) {
  return (
    <label className="number-field">
      <span className="field-label">{label}</span>

      <span className="number-input-wrap">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.value)}
        />

        {suffix && (
          <span className="input-suffix">{suffix}</span>
        )}
      </span>
    </label>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
  left,
  right,
}) {
  return (
    <div className="slider-field">
      <div className="slider-top">
        <span className="field-label">{label}</span>
        <strong>{display}</strong>
      </div>

      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />

      <div className="range-labels">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/* RESULT CARDS */

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  variant = "",
}) {
  return (
    <div className={`metric-card ${variant}`}>
      <span className="metric-icon">
        <Icon size={18} />
      </span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>

      {payload.map((entry) => (
        <div className="tooltip-row" key={entry.dataKey}>
          <span
            className="tooltip-dot"
            style={{ background: entry.color }}
          />
          <span>{entry.name}</span>
          <b>{money(entry.value)}</b>
        </div>
      ))}
    </div>
  );
}

/* SIP CALCULATOR */

function Calculator() {
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [stepUp, setStepUp] = useState(DEFAULTS.stepUp);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);

  const result = useMemo(
    () =>
      calculateSip(
        monthly,
        rate,
        years,
        stepUpEnabled ? stepUp : 0
      ),
    [monthly, rate, years, stepUp, stepUpEnabled]
  );

  const reset = () => {
    setMonthly(DEFAULTS.monthly);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setStepUp(DEFAULTS.stepUp);
    setStepUpEnabled(false);
  };

  const updateMonthly = (value) => {
    if (value === "") {
      setMonthly("");
      return;
    }

    const next = Number(value);

    if (Number.isFinite(next)) {
      setMonthly(Math.min(10000000, Math.max(500, next)));
    }
  };

  const safeMonthly =
    Number.isFinite(Number(monthly)) && Number(monthly) >= 500
      ? Number(monthly)
      : 500;

  const safeResult = useMemo(
    () =>
      calculateSip(
        safeMonthly,
        rate,
        years,
        stepUpEnabled ? stepUp : 0
      ),
    [safeMonthly, rate, years, stepUp, stepUpEnabled]
  );

  return (
    <section className="calculator-section" id="calculator">
      <div className="container">
        <div className="section-heading calculator-heading">
          <span className="eyebrow">Your wealth, visualised</span>

          <h2 className="section-title">
            Small steps today.
            <br />
            <span className="gradient-text">
              A bigger tomorrow.
            </span>
          </h2>

          <p className="section-description">
            Discover how consistent monthly investing could help
            you build long-term wealth. Adjust the numbers and
            explore your projection.
          </p>
        </div>

        <div className="calculator-layout">
          <div className="calculator-card card">
            <div className="card-heading">
              <div>
                <span className="mini-label">01 / CUSTOMISE</span>
                <h3>Your investment plan</h3>
              </div>

              <button className="reset-button" onClick={reset}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div className="investment-control">
              <SliderField
                label="Monthly investment"
                value={safeMonthly}
                onChange={setMonthly}
                min={500}
                max={100000}
                step={500}
                display={money(safeMonthly)}
                left="₹500"
                right="₹1,00,000"
              />

              <NumberField
                label="Enter amount"
                value={monthly}
                onChange={updateMonthly}
                min={500}
                max={10000000}
                step={500}
              />
            </div>

            <div className="control-divider" />

            <SliderField
              label="Expected annual return"
              value={rate}
              onChange={setRate}
              min={0}
              max={30}
              step={0.5}
              display={`${rate}%`}
              left="0%"
              right="30%"
            />

            <div className="control-divider" />

            <SliderField
              label="Investment duration"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
              display={`${years} ${
                years === 1 ? "year" : "years"
              }`}
              left="1 year"
              right="40 years"
            />

            <div className="control-divider" />

            <div className="stepup-heading">
              <div>
                <strong>Annual SIP step-up</strong>
                <p>
                  Increase your contribution as your income grows.
                </p>
              </div>

              <button
                className={`switch ${
                  stepUpEnabled ? "switch-on" : ""
                }`}
                role="switch"
                aria-checked={stepUpEnabled}
                aria-label="Enable annual SIP step-up"
                onClick={() =>
                  setStepUpEnabled(!stepUpEnabled)
                }
              >
                <span />
              </button>
            </div>

            {stepUpEnabled && (
              <div className="stepup-control">
                <SliderField
                  label="Yearly increase"
                  value={stepUp}
                  onChange={setStepUp}
                  min={1}
                  max={25}
                  step={1}
                  display={`${stepUp}%`}
                  left="1%"
                  right="25%"
                />
              </div>
            )}

            <div className="calculator-footnote">
              <ShieldCheck size={16} />
              <span>
                Illustrative estimate only. Returns are not
                guaranteed.
              </span>
            </div>
          </div>

          <div className="results-column">
            <div className="wealth-card">
              <div className="wealth-card-top">
                <div>
                  <span className="mini-label">
                    02 / YOUR PROJECTION
                  </span>
                  <p className="wealth-label">
                    Estimated future value
                  </p>
                </div>

                <span className="wealth-icon">
                  <TrendingUp size={20} />
                </span>
              </div>

              <div className="wealth-value">
                {compactMoney(safeResult.value)}
              </div>

              <p className="wealth-caption">
                Potential value after {years}{" "}
                {years === 1 ? "year" : "years"}
              </p>

              <div className="wealth-divider" />

              <div className="wealth-breakdown">
                <div>
                  <span>
                    <i className="legend-dot invested-dot" />
                    Total invested
                  </span>
                  <strong>
                    {compactMoney(safeResult.invested)}
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="legend-dot returns-dot" />
                    Estimated returns
                  </span>
                  <strong className="returns-text">
                    {compactMoney(safeResult.returns)}
                  </strong>
                </div>
              </div>

              <div className="wealth-progress">
                <span
                  style={{
                    width: `${
                      safeResult.value > 0
                        ? (safeResult.invested /
                            safeResult.value) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="wealth-progress-labels">
                <span>Your contributions</span>
                <span>Potential growth</span>
              </div>
            </div>

            <div className="mini-metrics">
              <MetricCard
                icon={Wallet}
                label="Monthly SIP"
                value={compactMoney(safeMonthly)}
                note="Starting contribution"
              />

              <MetricCard
                icon={Coins}
                label="Wealth multiple"
                value={`${
                  safeResult.invested > 0
                    ? (
                        safeResult.value /
                        safeResult.invested
                      ).toFixed(2)
                    : "0.00"
                }×`}
                note="Value vs. invested"
                variant="metric-blue"
              />
            </div>
          </div>
        </div>

        <div className="chart-card card">
          <div className="chart-heading">
            <div>
              <span className="mini-label">
                03 / THE BIG PICTURE
              </span>
              <h3>Your wealth journey</h3>
              <p>
                See how your contributions and potential returns
                may grow over time.
              </p>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot invested-dot" />
                Invested
              </span>
              <span>
                <i className="legend-dot returns-dot" />
                Projected value
              </span>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={safeResult.data}
                margin={{
                  top: 12,
                  right: 8,
                  left: 8,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="valueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2864f0"
                      stopOpacity={0.24}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2864f0"
                      stopOpacity={0.01}
                    />
                  </linearGradient>

                  <linearGradient
                    id="investedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#9eb8ec"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="#9eb8ec"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--chart-grid, #e8edf5)"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="year"
                  tick={{
                    fill: "var(--chart-text, #8390a5)",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />

                <YAxis
                  tickFormatter={compactMoney}
                  tick={{
                    fill: "var(--chart-text, #8390a5)",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />

                <Tooltip content={<ChartTooltip />} />

                <Area
                  type="monotone"
                  dataKey="invested"
                  name="Invested"
                  stroke="#9eb8ec"
                  strokeWidth={2}
                  fill="url(#investedGradient)"
                  activeDot={{ r: 4 }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Projected value"
                  stroke="#2864f0"
                  strokeWidth={3}
                  fill="url(#valueGradient)"
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-disclaimer">
            <CircleHelp size={14} />
            <span>
              Assumes monthly contributions at month-end and a
              constant annual return rate divided monthly.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* FAQ CONTENT */

const faqs = [
  {
    question: "What is a Systematic Investment Plan (SIP)?",
    answer:
      "A SIP is a way to invest a fixed amount into a mutual fund at regular intervals, often monthly. It helps build a consistent investing habit, but it does not remove market risk or guarantee a profit.",
  },
  {
    question: "How is the SIP calculator estimate calculated?",
    answer:
      "This calculator adds each monthly contribution and applies the assumed monthly rate to the accumulated balance. It assumes contributions at the end of each month and an annual return divided by 12. Actual investment returns vary and may be negative.",
  },
  {
    question: "Are the returns guaranteed?",
    answer:
      "No. The expected annual return is an assumption used for illustration, not a promise. Mutual fund investments are subject to market risks, and actual results may be higher or lower than the projection.",
  },
  {
    question: "What is a step-up SIP?",
    answer:
      "A step-up SIP increases your monthly contribution by a chosen percentage each year. This can illustrate how investing more as your income grows may affect the projected result. It does not guarantee better investment performance.",
  },
  {
    question: "How much should I invest every month?",
    answer:
      "Choose an amount that fits your budget, emergency savings, time horizon, and financial goals. Consider your existing obligations and risk tolerance before committing to an investment plan.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-layout">
        <div className="section-heading">
          <span className="eyebrow">Clear answers</span>

          <h2 className="section-title">
            Good decisions start with{" "}
            <span className="gradient-text">good questions.</span>
          </h2>

          <p className="section-description">
            A few things worth understanding before planning your
            investments.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${
                open === index ? "faq-open" : ""
              }`}
              key={faq.question}
            >
              <button
                className="faq-question"
                onClick={() =>
                  setOpen(open === index ? -1 : index)
                }
                aria-expanded={open === index}
              >
                <span>{faq.question}</span>
                <ChevronDown size={19} />
              </button>

              {open === index && (
                <p className="faq-answer">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* HOW IT WORKS */

function HowItWorks() {
  const steps = [
    {
      icon: IndianRupee,
      number: "01",
      title: "Choose your SIP",
      text: "Set the monthly amount that fits your investing budget.",
    },
    {
      icon: Clock3,
      number: "02",
      title: "Set your horizon",
      text: "Explore different time frames and illustrative return assumptions.",
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "Explore the outcome",
      text: "Compare contributions and projected growth to help plan your goals.",
    },
  ];

  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Simple by design</span>

          <h2 className="section-title">
            Three steps to a clearer{" "}
            <span className="gradient-text">
              financial picture.
            </span>
          </h2>
        </div>

        <div className="steps-grid">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <article className="step-card card" key={number}>
              <div className="step-top">
                <span className="step-icon">
                  <Icon size={21} />
                </span>
                <span className="step-number">{number}</span>
              </div>

              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* HERO SECTION */

function Hero() {
  const example = calculateSip(10000, 12, 15);

  return (
    <section className="hero-section" id="home">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />

      <div className="container hero-inner">
        <div className="hero-copy animate-in">
          <span className="hero-pill">
            <Sparkles size={14} />
            A smarter way to plan ahead
          </span>

          <h1>
            Make your money
            <br />
            move with <span className="hero-highlight">purpose.</span>
          </h1>

          <p>
            Turn today’s small, consistent investments into a
            clearer vision for tomorrow. Explore your possibilities
            with the VISIONBYDJ SIP Wealth Planner.
          </p>

          <div className="hero-actions">
            <a
              className="btn btn-primary hero-button"
              href="#calculator"
            >
              Calculate your future <ArrowRight size={17} />
            </a>

            <a
              className="hero-text-link"
              href="#how-it-works"
            >
              Explore how it works <ArrowDownRight size={16} />
            </a>
          </div>

          <div className="hero-trust">
            <span>
              <Check size={15} /> Free to use
            </span>
            <span>
              <Check size={15} /> Instant estimates
            </span>
            <span>
              <Check size={15} /> No sign-up needed
            </span>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Illustration of long-term wealth growth"
        >
          <div className="visual-glow" />

          <div className="floating-tag floating-tag-top">
            <span className="floating-tag-icon">
              <TrendingUp size={17} />
            </span>
            <span>
              <small>Long-term outlook</small>
              <strong>Think in years</strong>
            </span>
          </div>

          <div className="visual-panel">
            <div className="visual-panel-head">
              <div>
                <span className="visual-overline">
                  YOUR FINANCIAL VISION
                </span>
                <strong>Growth in perspective</strong>
              </div>

              <span className="visual-status">
                <i /> Illustrative
              </span>
            </div>

            <div className="visual-number">
              {compactMoney(example.value)}
            </div>

            <span className="visual-caption">
              Potential value of a ₹10,000 monthly SIP over 15 years
            </span>

            <svg
              className="hero-chart"
              viewBox="0 0 440 180"
              role="img"
              aria-label="Illustrative upward investment growth curve"
            >
              <defs>
                <linearGradient
                  id="heroArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#4e8cff"
                    stopOpacity=".32"
                  />
                  <stop
                    offset="100%"
                    stopColor="#4e8cff"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {[35, 75, 115, 155].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="440"
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity=".1"
                  strokeDasharray="4 6"
                />
              ))}

              <path
                d="M0 160 C35 156 48 151 75 148 S125 133 150 126 S200 109 225 93 S270 84 295 65 S335 53 360 32 S410 16 440 5 L440 180 L0 180 Z"
                fill="url(#heroArea)"
              />

              <path
                d="M0 160 C35 156 48 151 75 148 S125 133 150 126 S200 109 225 93 S270 84 295 65 S335 53 360 32 S410 16 440 5"
                fill="none"
                stroke="#4e8cff"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle
                cx="360"
                cy="32"
                r="5"
                fill="#ffffff"
                stroke="#4e8cff"
                strokeWidth="3"
              />
            </svg>

            <div className="visual-axis">
              <span>START</span>
              <span>TIME &amp; CONSISTENCY</span>
              <span>FUTURE</span>
            </div>
          </div>

          <div className="floating-tag floating-tag-bottom">
            <span className="gold-spark">
              <Sparkles size={17} />
            </span>
            <span>
              <small>Build the habit</small>
              <strong>One month at a time</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="container hero-bottom">
        <span>BUILT FOR CLARITY</span>
        <div className="hero-bottom-line" />
        <span>MADE FOR YOUR NEXT CHAPTER</span>
      </div>
    </section>
  );
}

/* FOOTER */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Brand small />
          <p className="footer-tagline">
            A clearer view of your financial possibilities.
          </p>
        </div>

        <div className="footer-right">
          <p>
            <strong>Important disclaimer</strong>
            <br />
            This calculator provides estimates for educational
            purposes only. It is not investment advice, a
            recommendation, or a guarantee of returns. Mutual fund
            investments are subject to market risks. Please read all
            scheme-related documents carefully and consult a
            qualified financial adviser when needed.
          </p>

          <span>
            © {new Date().getFullYear()} VISIONBYDJ. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* MAIN APP */

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("visionbydj-theme") === "dark";
    } catch {
      return false;
    }
  });

  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem("visionbydj-intro-seen");
    } catch {
      return true;
    }
  });

  const finishIntro = () => {
    setShowIntro(false);

    try {
      sessionStorage.setItem("visionbydj-intro-seen", "yes");
    } catch {
      // The intro still works when browser storage is unavailable.
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        "visionbydj-theme",
        dark ? "dark" : "light"
      );
    } catch {
      // Theme switching remains available for this session.
    }
  }, [dark]);

  return (
    <div className={`app ${dark ? "dark-theme" : ""}`}>
      {showIntro && <IntroOverlay onFinish={finishIntro} />}

      <Header dark={dark} setDark={setDark} />

      <main>
        <Hero />
        <Calculator />
        <HowItWorks />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
