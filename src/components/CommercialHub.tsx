import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Plane, 
  Ship, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Zap, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  Globe2, 
  Percent, 
  BarChart3,
  ExternalLink
} from 'lucide-react';

export const CommercialHub: React.FC = () => {
  // Industry selection
  const [activeIndustry, setActiveIndustry] = useState<'aviation' | 'maritime' | 'energy' | 'insurance'>('aviation');

  // ROI Calculator State
  const [fleetSize, setFleetSize] = useState<number>(45);
  const [monthlyFuelSpend, setMonthlyFuelSpend] = useState<number>(1200000); // $1.2M
  const [routeCount, setRouteCount] = useState<number>(180);

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<string>('/v1/route/optimize');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isCallingApi, setIsCallingApi] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isPilotModalOpen, setIsPilotModalOpen] = useState<boolean>(false);

  // Dynamic ROI Calculations
  const efficiencyRate = activeIndustry === 'aviation' ? 0.038 : activeIndustry === 'maritime' ? 0.052 : activeIndustry === 'energy' ? 0.074 : 0.045;
  const annualSavings = Math.round(monthlyFuelSpend * 12 * efficiencyRate);
  const co2TonsReduced = Math.round(annualSavings / 260);
  const subscriptionCost = activeIndustry === 'aviation' ? 35880 : activeIndustry === 'maritime' ? 29988 : 19980;
  const netRoiPercent = Math.round(((annualSavings - subscriptionCost) / subscriptionCost) * 100);
  const paybackMonths = Number((subscriptionCost / (annualSavings / 12)).toFixed(1));

  // Handle simulated API test call
  const handleTestApi = () => {
    setIsCallingApi(true);
    setTimeout(() => {
      setIsCallingApi(false);
      setApiResponse(
        JSON.stringify(
          {
            status: 'success',
            statusCode: 200,
            latencyMs: 24.6,
            query: {
              origin: 'KSFO',
              destination: 'RJTT',
              flightLevel: 'FL360',
              timestampUtc: new Date().toISOString(),
            },
            optimizedRoute: {
              recommendedWaypoints: ['KSFO', 'PAINT', 'EUGEN', 'NIPPI', 'OMOTO', 'RJTT'],
              windVectorAdvantageKts: '+32.4 kts (Tailwind)',
              estimatedFuelSavedKg: 2840,
              costSavingsUsd: 3124.0,
              severeTurbulenceClearAirRisk: 'Low (< 12%)',
              eyewallAvoidanceVector: 'Diverted 80nm North of Malakas',
            },
            dataPipeline: {
              satelliteConstellation: 'GOES-18 ABI + Himawari-9 AHI',
              assimilationEngine: 'AeroStream 4D-Var Native 0.10°',
            },
          },
          null,
          2
        )
      );
    }, 450);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Executive Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-[#0c1322] via-[#09101d] to-[#060a12] p-6 md:p-8 shadow-2xl">
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Commercial Weather Intelligence & B2B Monetization Engine</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
            How AeroStream Turns Planetary Physics Into Multi-Million Dollar Fleet Savings
          </h2>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Standard weather forecasts rely on coarse 25 km models updated every 6 hours. AeroStream runs a
            continuous <strong className="text-cyan-300">0.10° (9 km) non-hydrostatic 4D-Var data assimilation pipeline</strong> that
            fuses 6 satellite constellations in real time. This lets airlines ride jet streams, shipping lines bypass 30-foot typhoon waves, and energy grids dispatch wind farms with 99.4% confidence.
          </p>

          {/* Quick High-Level Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#06080e]/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Fleet Fuel Saved Today</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">$384,520</span>
              <span className="text-[10px] text-slate-500 block">Across 1,420 routed flights</span>
            </div>

            <div className="bg-[#06080e]/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">CO₂ Reduced</span>
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">1,120 Tons</span>
              <span className="text-[10px] text-slate-500 block">Scope-1 Aviation ESG credit</span>
            </div>

            <div className="bg-[#06080e]/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Active Storm Diversions</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">18 Vessels</span>
              <span className="text-[10px] text-slate-500 block">Safe typhoon bypass verified</span>
            </div>

            <div className="bg-[#06080e]/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Average B2B ROI</span>
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">840%</span>
              <span className="text-[10px] text-slate-500 block">Payback in &lt; 2 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Industries & Real-World Use Cases */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Four Multi-Billion Dollar Enterprise Markets</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select an enterprise sector to inspect exact operational workflows and financial returns.</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#0a0e1a] rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveIndustry('aviation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeIndustry === 'aviation' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              Airlines
            </button>
            <button
              onClick={() => setActiveIndustry('maritime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeIndustry === 'maritime' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              Shipping
            </button>
            <button
              onClick={() => setActiveIndustry('energy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeIndustry === 'energy' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              Clean Energy
            </button>
            <button
              onClick={() => setActiveIndustry('insurance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                activeIndustry === 'insurance' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Insurance
            </button>
          </div>
        </div>

        {/* Selected Industry Card Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 bg-[#0a0e1a] border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
          <div className="lg:col-span-2 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase font-semibold mb-1">
                <span>Enterprise Solution Spotlight</span>
                <span>·</span>
                <span>Contract Value: $50k – $250k / year</span>
              </div>

              <h4 className="text-xl font-bold text-white">
                {activeIndustry === 'aviation' && 'Commercial Airline Flight Dispatch & Fuel Optimization'}
                {activeIndustry === 'maritime' && 'Trans-Oceanic Container Vessel Storm & Swell Routing'}
                {activeIndustry === 'energy' && 'Renewable Wind Farm Generation & Solar Irradiance Forecasting'}
                {activeIndustry === 'insurance' && 'Parametric Agriculture & Severe Storm Catastrophe Hedging'}
              </h4>

              <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                {activeIndustry === 'aviation' &&
                  'Jet streams move at up to 160 knots. By calculating real-time 3D wind vectors and clear-air turbulence indices at FL320–FL400, flight dispatchers shave an average of 18 minutes and 2,400 kg of fuel off long-haul flights while avoiding passenger-injury turbulence.'}
                {activeIndustry === 'maritime' &&
                  'A container ship burning 150 metric tons of fuel per day loses $80,000 for every day delayed by heavy seas. AeroStream models significant wave heights and storm surge paths, enabling dynamic diversions that preserve vessel schedules and prevent lost containers.'}
                {activeIndustry === 'energy' &&
                  'Utility grid operators pay steep non-delivery imbalance penalties if wind farms suddenly drop output. AeroStream calculates planetary boundary-layer gusts and cloud albedo with 9 km precision, ensuring optimal battery storage dispatch and power grid stability.'}
                {activeIndustry === 'insurance' &&
                  'Traditional crop insurance takes months to assess loss adjusters. AeroStream provides instant, cryptographically verifiable radar hail (dBZ) and sub-zero frost data streams that trigger automated smart contract payouts within 24 hours of extreme weather.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="bg-[#06080e] p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Operational Gain</span>
                <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                  {activeIndustry === 'aviation' && '+3.8% Fuel Savings'}
                  {activeIndustry === 'maritime' && '+5.2% Transit Efficiency'}
                  {activeIndustry === 'energy' && '+7.4% Higher Dispatch'}
                  {activeIndustry === 'insurance' && '99.4% Automated Settlement'}
                </span>
              </div>
              <div className="bg-[#06080e] p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Key Data Source</span>
                <span className="text-cyan-300 font-bold text-sm block mt-0.5">
                  {activeIndustry === 'aviation' && 'GOES/Himawari 4D-Var AMVs'}
                  {activeIndustry === 'maritime' && 'Satellite Altimetry & IR'}
                  {activeIndustry === 'energy' && 'Non-Hydrostatic DynCore'}
                  {activeIndustry === 'insurance' && 'NEXRAD Radar dBZ & Soundings'}
                </span>
              </div>
              <div className="bg-[#06080e] p-3 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Typical Contract</span>
                <span className="text-amber-300 font-bold text-sm block mt-0.5">
                  {activeIndustry === 'aviation' && '$4,500 / month / fleet'}
                  {activeIndustry === 'maritime' && '$2,999 / month / fleet'}
                  {activeIndustry === 'energy' && '$1,999 / month / grid'}
                  {activeIndustry === 'insurance' && '$0.002 / API query'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-[#06080e] rounded-lg border border-slate-800 p-5 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-mono text-cyan-400 font-semibold block mb-1">
                Commercial Deployment
              </span>
              <h5 className="text-base font-bold text-white">Ready-to-Deploy REST & WebSocket APIs</h5>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Connect your airline dispatch system, maritime navigation software, or energy trading desks in under 15 minutes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero legacy infrastructure needed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-50ms API response latency</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SOC-2 & WMO Standard Compliant</span>
              </div>
            </div>

            <button
              onClick={() => setIsPilotModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors shadow-lg shadow-cyan-400/10"
            >
              <span>Schedule Commercial Pilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Enterprise ROI & Cost Savings Calculator */}
      <div className="bg-[#0a0e1a] border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs uppercase font-mono text-cyan-400 font-semibold tracking-wider flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Interactive Enterprise ROI Calculator</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-0.5">
              Calculate Your Fleet's Annual Financial Return
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Based on empirical airline & maritime routing benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders Input Panel */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-300">Active Fleet / Asset Count:</span>
                <span className="text-cyan-400 font-bold text-sm">{fleetSize} Units</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>5 aircraft / ships</span>
                <span>200 aircraft / ships</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-300">Monthly Operational / Fuel Spend:</span>
                <span className="text-cyan-400 font-bold text-sm">${(monthlyFuelSpend / 1000).toLocaleString()}k / month</span>
              </div>
              <input
                type="range"
                min={100000}
                max={5000000}
                step={50000}
                value={monthlyFuelSpend}
                onChange={(e) => setMonthlyFuelSpend(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>$100,000 / mo</span>
                <span>$5,000,000 / mo</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-300">Monthly High-Risk / Trans-Oceanic Routes:</span>
                <span className="text-cyan-400 font-bold text-sm">{routeCount} Routes</span>
              </div>
              <input
                type="range"
                min={20}
                max={600}
                value={routeCount}
                onChange={(e) => setRouteCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Real-Time Projected Return Card */}
          <div className="lg:col-span-5 bg-[#06080e] rounded-xl border border-cyan-500/30 p-5 flex flex-col justify-between gap-4 shadow-2xl">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block mb-1">
                ESTIMATED ANNUAL VALUE RECOVERY
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
                  ${annualSavings.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-400">/ year</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Net operational profit boost after software licensing
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="bg-[#0a0f1d] p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Net ROI</span>
                <span className="text-emerald-400 font-bold text-base mt-0.5 block">
                  +{netRoiPercent}%
                </span>
              </div>
              <div className="bg-[#0a0f1d] p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Payback Period</span>
                <span className="text-cyan-400 font-bold text-base mt-0.5 block">
                  {paybackMonths} Months
                </span>
              </div>
              <div className="bg-[#0a0f1d] p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CO₂ Emissions</span>
                <span className="text-slate-200 font-bold text-base mt-0.5 block">
                  -{co2TonsReduced.toLocaleString()} tons
                </span>
              </div>
              <div className="bg-[#0a0f1d] p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Safety Index</span>
                <span className="text-amber-400 font-bold text-base mt-0.5 block">
                  99.8% Nominal
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsPilotModalOpen(true)}
              className="w-full py-2 text-xs font-semibold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              Request Custom Enterprise ROI Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Commercial SaaS & API Pricing Plans */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">B2B Commercial Subscription & API Plans</h3>
          <p className="text-xs text-slate-400 mt-0.5">Flexible deployment tiers tailored for logistics dispatchers, utilities, and financial institutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Plan 1 */}
          <div className="bg-[#0a0e1a] rounded-xl border border-slate-800 p-5 flex flex-col justify-between gap-5 hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400 font-semibold block mb-1">
                Developer & Regional Fleet
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">$499</span>
                <span className="text-xs text-slate-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ideal for regional charter airlines, local wind farm operators, and research developers.
              </p>

              <div className="space-y-2 mt-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>50,000 API queries / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>0.25° Synoptic global model</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thermal IR & Radar Reflectivity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON & CSV REST endpoints</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPilotModalOpen(true)}
              className="w-full py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              Select Starter Plan
            </button>
          </div>

          {/* Plan 2: Best Value Commercial Fleet */}
          <div className="bg-[#0a0e1a] rounded-xl border border-cyan-500/40 p-5 flex flex-col justify-between gap-5 shadow-2xl relative ring-1 ring-cyan-500/20">
            <div className="absolute -top-2.5 right-4 bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase font-mono px-2 py-0.5 rounded">
              Recommended Enterprise
            </div>

            <div>
              <span className="text-xs uppercase font-mono text-cyan-400 font-semibold block mb-1">
                Commercial Fleet Pro
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">$2,499</span>
                <span className="text-xs text-slate-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Full-scale airline dispatch, global container shipping fleets, and large power utilities.
              </p>

              <div className="space-y-2 mt-4 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Unlimited API calls (up to 1M/mo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Native 0.10° Non-Hydrostatic Core</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flight & Marine Optimal Waypoints</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Webhook Disaster Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NetCDF-4 & WMO GRIB2 streaming</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPilotModalOpen(true)}
              className="w-full py-2 text-xs font-semibold rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors shadow-lg shadow-cyan-400/10"
            >
              Start Commercial Fleet Pilot
            </button>
          </div>

          {/* Plan 3: Global Mesh Enterprise */}
          <div className="bg-[#0a0e1a] rounded-xl border border-slate-800 p-5 flex flex-col justify-between gap-5 hover:border-slate-700 transition-colors">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400 font-semibold block mb-1">
                Global Infrastructure Mesh
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">$9,900</span>
                <span className="text-xs text-slate-400 font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Global multi-carrier alliances, sovereign disaster authorities, and global reinsurers.
              </p>

              <div className="space-y-2 mt-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dedicated GPU tensor cluster instance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Custom boundary-layer data assimilation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>99.99% High-Availability SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Direct 24/7 meteorologist support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPilotModalOpen(true)}
              className="w-full py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>

      {/* Live Interactive API Test Console */}
      <div className="bg-[#0a0e1a] border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100 font-mono">
              Live Commercial API Sandbox (REST & Webhooks)
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            API Gateway Online: api.aerostream.io
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Test live flight route optimization and weather risk calculation endpoints. Pass origin, destination, and flight altitude to receive immediate aerodynamic advantage metrics.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[280px] bg-[#06080e] rounded-lg border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="text-slate-400">https://api.aerostream.io</span>
            <span className="text-cyan-300 font-semibold">{apiEndpoint}</span>
            <span className="text-slate-500">?origin=KSFO&dest=RJTT&level=FL360</span>
          </div>

          <button
            onClick={handleTestApi}
            disabled={isCallingApi}
            className="px-4 py-2 text-xs font-semibold rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isCallingApi ? 'Calculating Wind Vectors...' : 'Send API Query'}
          </button>
        </div>

        {/* API Response Display */}
        {apiResponse && (
          <div className="relative bg-[#06080e] rounded-lg border border-slate-800 p-4 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-emerald-400 font-bold">200 OK · 24.6ms execution</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiResponse);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] hover:text-white"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey ? 'Copied' : 'Copy Response'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 leading-relaxed">
              {apiResponse}
            </pre>
          </div>
        )}
      </div>

      {/* Commercial Pilot Modal */}
      {isPilotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a0e1a] border border-cyan-500/40 rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Schedule 30-Day Commercial Fleet Pilot
              </h4>
              <button onClick={() => setIsPilotModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Experience verified fuel savings on your active routes. We provision a dedicated 4D-Var data stream and provide side-by-side fuel consumption comparisons against standard GFS/ECMWF forecasts.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Pacific Cargo Logistics / Horizon Air"
                  className="w-full bg-[#06080e] border border-slate-800 rounded p-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="dispatch@airline.com"
                  className="w-full bg-[#06080e] border border-slate-800 rounded p-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Use Case</label>
                <select className="w-full bg-[#06080e] border border-slate-800 rounded p-2 text-white outline-none focus:border-cyan-500">
                  <option>Commercial Aviation Flight Dispatch</option>
                  <option>Maritime Cargo & Storm Wave Avoidance</option>
                  <option>Renewable Wind / Solar Grid Dispatch</option>
                  <option>Parametric Insurance Index Hedging</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Thank you! Your 30-day commercial pilot request has been registered. An AeroStream solutions engineer will email your sandbox API credentials within 1 hour.');
                setIsPilotModalOpen(false);
              }}
              className="w-full py-2.5 mt-2 text-xs font-bold rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors"
            >
              Confirm 30-Day Evaluation License
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
