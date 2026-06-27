import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const ORANGE = '#ff6b2b';

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// CSS-only parallax for the hero dockyard video (autoplay, moves slower than scroll)
function useSimpleParallax(maxShift = 150) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / (rect.height + viewH)));
      video.style.transform = `translateY(${(p - 0.5) * 2 * maxShift}px)`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [maxShift]);

  return [sectionRef, videoRef];
}

function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(target, duration = 2200, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPACE BACKGROUND — fixed, full-viewport, autoplay + CSS parallax
// The video plays smoothly on its own; scroll only shifts it vertically (no
// currentTime scrubbing, which always causes decode jank on large videos).
// ─────────────────────────────────────────────────────────────────────────────

function SpaceBackground() {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const scrollTarget = useRef(0);
  const scrollSmooth = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateScroll = () => {
      const viewH = window.innerHeight;
      const totalScroll = Math.max(1, document.documentElement.scrollHeight - viewH);
      const heroH = viewH; // skip the hero section
      const afterHero = Math.max(0, window.scrollY - heroH);
      scrollTarget.current = Math.min(1, afterHero / Math.max(1, totalScroll - heroH));
    };

    const tick = () => {
      scrollSmooth.current += (scrollTarget.current - scrollSmooth.current) * 0.055;
      const p = scrollSmooth.current;

      if (video) {
        // ±180px vertical shift — clearly visible as you scroll
        const y = (p - 0.5) * 360;
        // Scale grows 1.15 → 1.28 — slowly zooms into the stars
        const scale = 1.15 + p * 0.13;
        // Saturation 0.8 → 1.15 — space gets more vivid deeper in
        const sat = 0.8 + p * 0.35;
        video.style.transform = `translateY(${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        video.style.filter = `saturate(${sat.toFixed(2)})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      <video
        ref={videoRef}
        src="/Space-SciFi.mp4"
        autoPlay loop muted playsInline preload="auto"
        style={{
          position: 'absolute',
          top: '-25%', left: '-5%',
          width: '110%', height: '150%',
          objectFit: 'cover',
          willChange: 'transform, filter',
          transformOrigin: 'center center',
        }}
      />
      {/* Lighter overlay — video needs to be seen for parallax to register */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D GLOBE
// ─────────────────────────────────────────────────────────────────────────────

function latLonToVec3(lat, lon, r = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

const ROUTES = [
  { from: [28.6,  77.2],  to: [51.5,  -0.12] },
  { from: [19.1,  72.9],  to: [40.7,  -74.0] },
  { from: [ 1.35, 103.8], to: [35.7,  139.7] },
  { from: [31.2,  121.5], to: [37.6, -122.4] },
  { from: [25.2,   55.3], to: [48.9,    2.3] },
  { from: [22.3,  114.2], to: [-33.9, 151.2] },
  { from: [55.7,   37.6], to: [34.7,  135.5] },
];

function GlobeArc({ from, to, speed = 0.12 }) {
  const dotRef = useRef();
  const progress = useRef(Math.random());
  const points = useMemo(() => {
    const a = latLonToVec3(from[0], from[1]);
    const b = latLonToVec3(to[0], to[1]);
    const mid = a.clone().add(b).normalize().multiplyScalar(2.65);
    return new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(64);
  }, [from, to]);

  useFrame((_, dt) => {
    progress.current = (progress.current + dt * speed) % 1;
    const p = points[Math.floor(progress.current * (points.length - 1))];
    if (dotRef.current && p) dotRef.current.position.set(p.x, p.y, p.z);
  });

  return (
    <>
      <Line points={points} color={ORANGE} lineWidth={1.2} transparent opacity={0.45} />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.055, 7, 7]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
    </>
  );
}

function Globe() {
  const groupRef = useRef();
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * 0.09; });
  const cityDots = useMemo(() => ROUTES.flatMap(r => [r.from, r.to]), []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#080e1a" metalness={0.15} roughness={0.8} emissive="#081020" emissiveIntensity={0.55} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.015, 28, 28]} />
        <meshBasicMaterial color="#1a3060" wireframe transparent opacity={0.26} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.14, 32, 32]} />
        <meshBasicMaterial color="#1a50d0" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      {ROUTES.map((r, i) => <GlobeArc key={i} from={r.from} to={r.to} speed={0.1 + i * 0.014} />)}
      {cityDots.map((coord, i) => {
        const p = latLonToVec3(coord[0], coord[1], 2.04);
        return (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.046, 7, 7]} />
            <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={3} />
          </mesh>
        );
      })}
    </group>
  );
}

function GlobeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#4080ff" />
      <pointLight position={[0, 0, 6]} intensity={0.4} color={ORANGE} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <Suspense fallback={null}>
        <Globe />
      </Suspense>
    </Canvas>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({ children, style }) {
  return <div className="sc-glass" style={style}>{children}</div>;
}

function Eyebrow({ children, center = false }) {
  return (
    <p style={{
      color: ORANGE, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      marginBottom: 14, textAlign: center ? 'center' : 'left',
    }}>
      {children}
    </p>
  );
}

function AnimatedStat({ value, suffix, label, active }) {
  const count = useCountUp(value, 2200, active);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 48, fontWeight: 800, lineHeight: 1,
        background: `linear-gradient(135deg, ${ORANGE}, #ffaa60)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6, letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    title: 'WMS',
    name: 'Warehouse Management System',
    tagline: 'Every bin. Every pallet. Real-time.',
    desc: 'Complete warehouse operations from receiving to despatch with bin-level visibility and zero paper workflows.',
    features: ['Bin-level inventory tracking', 'Wave & batch picking', 'Inbound GRN automation', 'Cross-docking support', 'Exception workflow engine'],
    icon: '🏭',
    accent: '#ff6b2b',
  },
  {
    title: 'TMS',
    name: 'Transport Management System',
    tagline: 'Optimal routes. Zero guesswork.',
    desc: 'Plan, execute, and analyse every shipment with AI-powered route optimisation and real-time carrier tracking.',
    features: ['AI route optimisation', 'Multi-carrier integration', 'Real-time ETAs', 'ePOD & e-sign capture', 'Freight cost analytics'],
    icon: '🚛',
    accent: '#6366f1',
  },
  {
    title: 'EMS',
    name: 'Expense Management System',
    tagline: 'Control costs. Eliminate leakage.',
    desc: 'End-to-end expense visibility across your logistics operations — from freight costs to operational overheads.',
    features: ['Real-time cost tracking', 'Budget vs. actual dashboards', 'Automated approvals', 'Vendor reconciliation', 'P&L reporting'],
    icon: '💰',
    accent: '#22c55e',
  },
  {
    title: 'VisionWare',
    name: '3D Warehouse Simulation',
    tagline: 'Visualise. Simulate. Optimise.',
    desc: 'A digital twin of your warehouse — simulate layouts, test processes, and optimise slotting before going live.',
    features: ['3D warehouse modelling', 'Slotting optimisation', 'Process simulation', 'KPI prediction engine', 'Layout A/B testing'],
    icon: '🔷',
    accent: '#06b6d4',
  },
  {
    title: 'FMS',
    name: 'Fleet Management System',
    tagline: 'Your fleet. Always visible.',
    desc: 'Real-time GPS tracking, maintenance scheduling, and driver performance analytics for your entire vehicle fleet.',
    features: ['Live GPS tracking', 'Driver behaviour analytics', 'Maintenance scheduling', 'Fuel monitoring', 'Route playback'],
    icon: '🚗',
    accent: '#f59e0b',
  },
  {
    title: 'PTL',
    name: 'Part Truck Load',
    tagline: 'Fill every truck. Cut every cost.',
    desc: 'Intelligent consolidation of partial loads — matching shipments to maximise utilisation and slash freight costs.',
    features: ['Load consolidation engine', 'Cost-per-unit optimisation', 'Dynamic shipper matching', 'Utilisation analytics', 'Freight cost savings reports'],
    icon: '📦',
    accent: '#a78bfa',
  },
  {
    title: 'DMS',
    name: 'Dispatch Management System',
    tagline: 'Despatch faster. Deliver smarter.',
    desc: 'Streamline order allocation, vehicle assignment, and delivery scheduling from a single control centre.',
    features: ['Auto order allocation', 'Smart vehicle assignment', 'Delivery scheduling', 'Driver app integration', 'Live status updates'],
    icon: '📋',
    accent: '#ec4899',
  },
];

function ProductCard({ product, index }) {
  const [wrapRef, visible] = useInView(0.08);
  const { title, name, tagline, desc, features, icon, accent } = product;

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.65s ease ${index * 0.07}s, transform 0.65s ease ${index * 0.07}s`,
      }}
    >
      <div
        className="sc-product-card"
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${accent}30`,
          borderRadius: 20,
          padding: '32px 28px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', gap: 16,
          position: 'relative', overflow: 'hidden', height: '100%',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)`,
        }} />
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 140, height: 140,
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ fontSize: 38, lineHeight: 1 }}>{icon}</div>
        <div>
          <div style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1,
            background: `linear-gradient(135deg, #ffffff 40%, ${accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 5,
          }}>{title}</div>
          <div style={{ color: accent, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.75 }}>
            {name}
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{tagline}</p>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.68, flex: 1 }}>{desc}</p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.52)', fontSize: 12 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0, opacity: 0.85 }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — dockyard video with CSS parallax, fully covers the space background
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [sectionRef, videoRef] = useSimpleParallax(150);

  return (
    <section ref={sectionRef} className="sc-hero" id="sc-platform">
      <video
        ref={videoRef}
        className="sc-parallax-video"
        src="/dockyard.mp4"
        autoPlay loop muted playsInline preload="auto"
      />
      <div className="sc-hero-overlay-dark" />
      <div className="sc-hero-overlay-glow" />

      <div className="sc-hero-content">
        <div className="sc-hero-badge">Supply Chain Intelligence Platform</div>
        <h1 className="sc-hero-h1">
          Move the world's{' '}
          <span className="sc-orange-grad">supply chain.</span>
        </h1>
        <p className="sc-hero-sub">
          Real-time visibility, intelligent automation, and AI-driven decisions — across every warehouse, shipment, and last-mile delivery.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button className="sc-cta-btn sc-cta-btn-lg sc-cta-glow-btn">See the Platform</button>
          <button className="sc-ghost-btn sc-cta-btn-lg">Watch Demo ▶</button>
        </div>
      </div>

      <div className="sc-scroll-hint">
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
          Scroll
        </div>
        <div className="sc-scroll-line" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SupplyChain({ onClose }) {
  const [statsRef, statsVisible] = useInView(0.3);
  const [globeRef, globeVisible] = useInView(0.2);

  const STATS = [
    { value: 98,   suffix: '%',  label: 'Inventory Accuracy' },
    { value: 2400, suffix: '+',  label: 'Shipments Tracked Daily' },
    { value: 38,   suffix: '%',  label: 'Cycle Time Reduction' },
    { value: 14,   suffix: 'ms', label: 'Avg API Response' },
  ];

  const LIVE_CARDS = [
    { label: 'Shipments in Transit',    value: '2,847', delta: '+12 today',       color: ORANGE },
    { label: 'Warehouse Utilisation',   value: '73.4%', delta: '↑ 2.1% WoW',     color: '#22c55e' },
    { label: 'SLA Compliance',          value: '96.8%', delta: '↑ 0.4% MoM',     color: '#3b82f6' },
    { label: 'Active Carriers',         value: '38',    delta: '4 routes opt.',   color: '#a78bfa' },
    { label: 'Orders Pending Despatch', value: '142',   delta: '↓ 18 cleared',   color: '#f59e0b' },
    { label: 'AI Alerts Raised',        value: '3',     delta: '2 auto-resolved', color: '#ef4444' },
  ];

  return (
    <div className="sc-page">

      {/* ── SPACE VIDEO — fixed behind everything, scroll-driven ── */}
      <SpaceBackground />

      {/* ── NAV ── */}
      <nav className="sc-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="sc-back-btn" onClick={onClose}>← Portfolio</button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Apollo Supply Chain</span>
        </div>
        <div className="sc-nav-links">
          {['Platform', 'Products', 'Network', 'Contact'].map(l => (
            <a key={l} href={`#sc-${l.toLowerCase()}`} className="sc-nav-link">{l}</a>
          ))}
          <button className="sc-cta-btn">Get Demo</button>
        </div>
      </nav>

      {/* ── HERO (dockyard video, fully opaque — covers space bg) ── */}
      <HeroSection />

      {/* All sections below are position:relative z-index:1, semi-transparent
          so the space video shows through from behind */}

      {/* ── STATS ── */}
      <section ref={statsRef} className="sc-layer sc-stats-section">
        <div className="sc-stats-grid">
          {STATS.map((s, i) => (
            <AnimatedStat key={i} value={s.value} suffix={s.suffix} label={s.label} active={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="sc-products" className="sc-layer" style={{ padding: '100px 5vw' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Eyebrow center>The Platform</Eyebrow>
            <h2 className="sc-section-h2">One platform.<br />Every node.</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 500, margin: '16px auto 0', lineHeight: 1.65 }}>
              Seven integrated modules forming a complete supply chain operating system — deploy one or all.
            </p>
          </div>
          <div className="sc-products-grid">
            {PRODUCTS.map((p, i) => <ProductCard key={p.title} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── GLOBE ── */}
      <section ref={globeRef} id="sc-network" className="sc-layer sc-globe-section">
        <div className="sc-globe-grid">
          <div style={{
            opacity: globeVisible ? 1 : 0,
            transform: globeVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s ease',
          }}>
            <Eyebrow>Global Network</Eyebrow>
            <h2 className="sc-section-h2" style={{ textAlign: 'left', fontSize: 'clamp(30px,3.5vw,50px)' }}>
              Your supply chain,<br />
              <span className="sc-orange-grad">mapped in real time.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 15, lineHeight: 1.72, marginBottom: 30 }}>
              Every shipment, every supplier, every last-mile delivery — visualised on a live globe. Track network health, identify bottlenecks, and reroute instantly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Live shipment arcs',           desc: 'See every in-flight consignment on the network' },
                { label: 'Carrier performance heat map', desc: 'Identify underperforming lanes instantly' },
                { label: 'Risk zone overlays',           desc: 'Weather, geopolitical, and port congestion alerts' },
              ].map((item, i) => (
                <GlassCard key={i} style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>{item.desc}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          <div className="sc-globe-canvas" style={{ opacity: globeVisible ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
            {globeVisible && <GlobeScene />}
          </div>
        </div>
      </section>

      {/* ── LIVE DASHBOARD ── */}
      <section className="sc-layer sc-live-section">
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 5vw' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Eyebrow center>Live Intelligence</Eyebrow>
            <h2 style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Real-time command centre
            </h2>
          </div>
          <div className="sc-live-grid">
            {LIVE_CARDS.map((card, i) => (
              <GlassCard key={i} style={{ padding: '24px 26px' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10 }}>{card.label}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8 }}>{card.delta}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="sc-contact" className="sc-layer sc-cta-section">
        <div className="sc-cta-glow" />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Eyebrow center>Get Started</Eyebrow>
          <h2 className="sc-hero-h1" style={{ fontSize: 'clamp(32px,4.5vw,62px)', marginBottom: 20 }}>
            Ready to transform your<br />
            <span className="sc-orange-grad">supply chain?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 17, maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Book a 30-minute demo and see your operations reimagined in real time.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="sc-cta-btn sc-cta-btn-lg sc-cta-glow-btn">Book a Demo</button>
            <button className="sc-ghost-btn sc-cta-btn-lg">Download Brochure</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="sc-layer sc-footer">
        <div style={{ fontWeight: 700, fontSize: 14 }}>Apollo Supply Chain <span style={{ color: ORANGE }}>●</span></div>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>© {new Date().getFullYear()} All rights reserved.</div>
        <button className="sc-back-btn" onClick={onClose}>← Back to Portfolio</button>
      </footer>

      {/* ── STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sc-page {
          min-height: 100vh;
          color: #fff;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          /* No background — space video shows through from fixed layer */
        }

        /* Every content section sits above the fixed space video */
        .sc-layer {
          position: relative;
          z-index: 1;
        }

        /* ── NAV ── */
        .sc-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,107,43,0.14);
        }
        .sc-nav-links { display: flex; align-items: center; gap: 28px; }
        .sc-nav-link { color: rgba(255,255,255,0.48); font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .sc-nav-link:hover { color: #fff; }
        .sc-back-btn {
          background: none; border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.6); border-radius: 8px;
          padding: 6px 14px; cursor: pointer; font-size: 13px; transition: all 0.2s;
        }
        .sc-back-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
        .sc-cta-btn {
          background: ${ORANGE}; border: none; color: #fff;
          border-radius: 10px; padding: 9px 20px;
          cursor: pointer; font-size: 14px; font-weight: 700; transition: opacity 0.2s;
        }
        .sc-cta-btn:hover { opacity: 0.85; }
        .sc-cta-btn-lg { padding: 15px 34px; font-size: 15px; border-radius: 12px; }
        .sc-ghost-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.16);
          color: #fff; border-radius: 10px; padding: 9px 20px;
          cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;
        }
        .sc-ghost-btn:hover { background: rgba(255,255,255,0.11); }
        .sc-cta-glow-btn { box-shadow: 0 0 40px rgba(255,107,43,0.4); }

        .sc-glass {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,107,43,0.16);
          border-radius: 16px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        /* ── HERO — fully opaque to cover space video ── */
        .sc-hero {
          position: relative; z-index: 1;
          height: 100vh; min-height: 640px;
          display: flex; align-items: center; overflow: hidden;
          background: #000; /* fallback while video loads */
        }
        .sc-parallax-video {
          position: absolute; top: -20%; left: 0;
          width: 100%; height: 140%;
          object-fit: cover; will-change: transform;
        }
        .sc-hero-overlay-dark {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.18) 100%);
        }
        .sc-hero-overlay-glow {
          position: absolute; inset: 0; z-index: 2;
          background: radial-gradient(ellipse 55% 60% at 15% 55%, rgba(255,107,43,0.1) 0%, transparent 68%);
        }
        .sc-hero-content {
          position: relative; z-index: 10;
          padding: 0 6vw; max-width: 780px;
        }
        .sc-hero-badge {
          display: inline-block; font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase; color: ${ORANGE};
          border: 1px solid rgba(255,107,43,0.4); border-radius: 20px;
          padding: 5px 16px; margin-bottom: 26px;
        }
        .sc-hero-h1 {
          font-size: clamp(44px, 6.5vw, 76px);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1.04; margin-bottom: 20px;
        }
        .sc-hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.48);
          line-height: 1.7; margin-bottom: 36px; max-width: 520px;
        }
        .sc-orange-grad {
          background: linear-gradient(135deg, ${ORANGE}, #ffaa60);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sc-scroll-hint {
          position: absolute; bottom: 34px; left: 50%;
          transform: translateX(-50%); z-index: 10; text-align: center;
        }
        .sc-scroll-line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, rgba(255,107,43,0.75), transparent);
          margin: 0 auto; animation: scPulse 2.2s ease-in-out infinite;
        }
        @keyframes scPulse {
          0%,100% { opacity: 0.25; transform: scaleY(1); }
          50% { opacity: 0.9; transform: scaleY(1.35); }
        }

        /* ── STATS ── */
        .sc-stats-section {
          background: rgba(0,0,0,0.6);
          border-top: 1px solid rgba(255,107,43,0.13);
          border-bottom: 1px solid rgba(255,107,43,0.13);
          padding: 60px 5vw;
        }
        .sc-stats-grid {
          max-width: 1120px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr); gap: 40px;
        }

        /* ── SHARED ── */
        .sc-section-h2 {
          font-size: clamp(32px, 4.5vw, 56px);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 8px;
          text-align: center;
        }

        /* ── PRODUCTS GRID ── */
        .sc-products-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;
        }
        .sc-product-card { transition: transform 0.28s ease, box-shadow 0.28s ease; cursor: default; }
        .sc-product-card:hover { transform: translateY(-6px); box-shadow: 0 24px 64px rgba(0,0,0,0.6); }

        /* ── GLOBE ── */
        .sc-globe-section { padding: 96px 5vw; }
        .sc-globe-grid {
          max-width: 1120px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
        }
        .sc-globe-canvas { height: 480px; }

        /* ── LIVE ── */
        .sc-live-section {
          background: rgba(0,0,0,0.55);
          border-top: 1px solid rgba(255,107,43,0.09);
          padding: 88px 0;
        }
        .sc-live-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }

        /* ── CTA ── */
        .sc-cta-section { padding: 130px 5vw; text-align: center; overflow: hidden; }
        .sc-cta-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 65% at 50% 50%, rgba(255,107,43,0.12) 0%, transparent 70%);
        }

        /* ── FOOTER ── */
        .sc-footer {
          background: rgba(0,0,0,0.7);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 32px 5vw;
          display: flex; justify-content: space-between; align-items: center;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .sc-products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .sc-nav-link { display: none; }
          .sc-stats-grid { grid-template-columns: repeat(2,1fr); gap: 28px; }
          .sc-globe-grid { grid-template-columns: 1fr; }
          .sc-globe-canvas { height: 360px; }
          .sc-live-grid { grid-template-columns: repeat(2,1fr); }
          .sc-footer { flex-direction: column; gap: 16px; text-align: center; }
        }
        @media (max-width: 640px) {
          .sc-products-grid { grid-template-columns: 1fr; }
          .sc-stats-grid { grid-template-columns: repeat(2,1fr); gap: 20px; }
          .sc-live-grid { grid-template-columns: 1fr; }
          .sc-hero-h1 { font-size: 38px; }
        }
      `}</style>
    </div>
  );
}
