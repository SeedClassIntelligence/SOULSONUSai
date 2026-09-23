import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Sparkles,
  Check,
  Music,
  Mic,
  Sliders,
  Shield,
  Tag,
  Volume2,
  Trash2,
} from 'lucide-react';
import { SessionPlayerPersona } from '../../types/soulsonus';

interface RecruitPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecruitPlayer: (player: SessionPlayerPersona, createDawTrack: boolean) => void;
  existingPlayerIds: string[];
}

const PRESET_ROSTER: SessionPlayerPersona[] = [
  {
    id: 'player_mateo',
    name: 'MATEO',
    role: 'GUITAR',
    tags: ['Neo-Soul', 'Gospel R&B', 'Rhythm'],
    status: 'SESSION READY',
    instrument: '1962 Fender Stratocaster (Neck Pickup)',
    bio: 'Fluid neo-soul and church guitarist specializing in double-stops, thumb hammer-ons, and warm velvet rhythm comping.',
    allowedVariations: 'Permitted: chromatic approach slides, chord inversions. Prohibited: distortion or mid-frequency clutter.',
    rules: [
      'Locks with Marcus bass walking lines',
      'Ducks velocity during lead vocal phrases',
      'Subtle analog chorus with tape flutter',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · Velvet Chord Comping',
        description: 'Tender neo-soul rhythm comping with warm vibrato.',
        grooveVibe: 'Laid-back Soul',
        harmonicFlavor: 'Extended 9ths & 11ths',
        clipId: 'c_mat1',
      },
      {
        id: 2,
        title: 'Take 2 · Melodic Turnarounds',
        description: 'Double-stop fills into chorus and emotional peaks.',
        grooveVibe: 'Gospel Dynamic',
        harmonicFlavor: 'Dorian Slides',
        clipId: 'c_mat2',
      },
    ],
  },
  {
    id: 'player_chloe',
    name: 'CHLOE',
    role: 'BGV VOCALIST',
    tags: ['Soprano', 'Harmonies', 'Vocal Stack'],
    status: 'HARMONY READY',
    instrument: 'Solo Gospel Soprano Formant',
    bio: 'Dynamic soprano vocalist with gospel heritage. Delivers crystalline high harmonies, delicate ad-lib riffs, and formant alignment.',
    allowedVariations: 'Permitted: dynamic vibrato swell, unison doubling. Prohibited: over-riding lead vocal syllables.',
    rules: [
      'Aligns formant vowel shapes with lead vocal',
      'Flanks final chorus on +3rd and octave lift',
      'Auto-ducks 3dB beneath lead vocal consonants',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · High Harmony Triad',
        description: 'Airy third harmony above chorus hook with gentle vibrato.',
        grooveVibe: 'Vocal Ensemble',
        harmonicFlavor: 'Upper Triad (+3rd)',
        clipId: 'c_ch1',
      },
      {
        id: 2,
        title: 'Take 2 · Soulful Ad-lib Accents',
        description: 'Subtle high runs and breath calls in response to lead hook.',
        grooveVibe: 'Free Melisma',
        harmonicFlavor: 'Blues Pentatonic',
        clipId: 'c_ch2',
      },
    ],
  },
  {
    id: 'player_devon',
    name: 'DEVON',
    role: 'PERCUSSION',
    tags: ['Groove', 'Pocket', 'Organic'],
    status: 'SESSION READY',
    instrument: 'Vintage Shakers, Congas & Tambourine',
    bio: 'Subtle groove percussionist adding organic human swing and top-end shimmer without cluttering Jay’s acoustic drum kit.',
    allowedVariations: 'Permitted: off-beat accents, dynamic shaker intensity. Prohibited: tempo rushes.',
    rules: [
      'Locks precisely to 16th-note swing pocket',
      'Accents beat 2 and 4 on tambourine',
      'Dynamic conga slap on bar turnarounds',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · 16th-Note Shaker & Tambourine',
        description: 'Gentle organic shaker loop with tambourine backbeat.',
        grooveVibe: 'Humanized Shaker',
        harmonicFlavor: 'Rhythmic Shimmer',
        clipId: 'c_dev1',
      },
    ],
  },
  {
    id: 'player_amara',
    name: 'AMARA',
    role: 'STRINGS',
    tags: ['Chamber', 'Cello', 'Cinematic'],
    status: 'SESSION READY',
    instrument: 'Acoustic Cello & Chamber Strings',
    bio: 'Expressive cellist and chamber arranger delivering rich lower-mid resonance, emotional legato phrasing, and cinematic soul swells.',
    allowedVariations: 'Permitted: expressive vibrato swells, portamento. Prohibited: low-frequency rumble clashing with bass.',
    rules: [
      'Builds dynamic intensity toward Chorus and Bridge',
      'High-pass at 150Hz to preserve Marcus bass clarity',
      'Glides smoothly between chord changes',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · Warm Legato Swell',
        description: 'Emotional cello and viola lines holding long sustained chords.',
        grooveVibe: 'Flowing Legato',
        harmonicFlavor: 'Minor 9th Pads',
        clipId: 'c_am1',
      },
    ],
  },
  {
    id: 'player_leon',
    name: 'LEON',
    role: 'BRASS',
    tags: ['Stabs', 'Soul', 'Horns'],
    status: 'SESSION READY',
    instrument: 'Muted Trumpet & Tenor Saxophone Duo',
    bio: 'Motown and Stax-rooted horn arranger delivering crisp syncopated brass stabs, warm swells, and emotional muted trumpet answers.',
    allowedVariations: 'Permitted: fall-offs, crescendo swells. Prohibited: playing continuously over vocals.',
    rules: [
      'Stabs strictly on syncopated off-beats (the "and" of 2 and 4)',
      'Counter-melody only during vocal breath spaces',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · Syncopated Soul Stabs',
        description: 'Tight brass hits reinforcing chorus chord accents.',
        grooveVibe: 'Punchy Vintage',
        harmonicFlavor: 'Brass 7ths & 9ths',
        clipId: 'c_leo1',
      },
    ],
  },
  {
    id: 'player_noah',
    name: 'NOAH',
    role: 'SYNTH',
    tags: ['Analog', 'Pads', 'Atmosphere'],
    status: 'SESSION READY',
    instrument: 'Sequential Prophet-6 & Moog Sub-37',
    bio: 'Analog synthesizer specialist crafting warm polyphonic pads, expressive filter sweeps, and subtle sub-harmonic glue.',
    allowedVariations: 'Permitted: slow filter cutoff modulations, panning delays.',
    rules: [
      'Follows track harmony without dominant lead melodies',
      'Spreads stereo field wide (65%+) to leave center for vocals and bass',
    ],
    activeTake: 1,
    takes: [
      {
        id: 1,
        title: 'Take 1 · Warm Analog Ambient Pad',
        description: 'Lush prophet filter sweep filling frequency pockets.',
        grooveVibe: 'Slow Atmospheric Drift',
        harmonicFlavor: 'Chroma Warmth',
        clipId: 'c_noah1',
      },
    ],
  },
];

export const RecruitPlayerModal: React.FC<RecruitPlayerModalProps> = ({
  isOpen,
  onClose,
  onRecruitPlayer,
  existingPlayerIds,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'custom'>('roster');
  const [createTrack, setCreateTrack] = useState<boolean>(true);

  // Custom Player Form State
  const [customName, setCustomName] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('GUITAR');
  const [customInstrument, setCustomInstrument] = useState<string>('');
  const [customTags, setCustomTags] = useState<string>('Gospel, Soul, Modern');
  const [customBio, setCustomBio] = useState<string>('');
  const [customRules, setCustomRules] = useState<string>(
    'Stay out of the lead vocal lane\nLock dynamically with the rhythm section'
  );
  const [customVibe, setCustomVibe] = useState<string>('Tight Soul Pocket');

  if (!isOpen) return null;

  const handleRecruitPreset = (preset: SessionPlayerPersona) => {
    // Generate unique ID if already exists
    const id = existingPlayerIds.includes(preset.id)
      ? `${preset.id}_${Date.now()}`
      : preset.id;
    onRecruitPlayer({ ...preset, id }, createTrack);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newId = `player_${customName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const rulesArray = customRules
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    const tagsArray = customTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPlayer: SessionPlayerPersona = {
      id: newId,
      name: customName.toUpperCase().trim(),
      role: customRole.toUpperCase().trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Custom', 'Soul'],
      status: customRole.toLowerCase().includes('vocal')
        ? 'HARMONY READY'
        : 'SESSION READY',
      instrument: customInstrument.trim() || `${customRole} Sound Engine`,
      bio:
        customBio.trim() ||
        `Custom session musician specializing in ${customRole.toLowerCase()} with intuitive responsiveness to creator direction.`,
      allowedVariations: 'Permitted: harmonic turnarounds and stylistic fills.',
      rules:
        rulesArray.length > 0
          ? rulesArray
          : [
              'Locks to song groove and tempo',
              'Preserves space for creator lead performance',
            ],
      activeTake: 1,
      takes: [
        {
          id: 1,
          title: 'Take 1 · Initial Rehearsal',
          description: `Custom ${customRole} initial take following track guidelines.`,
          grooveVibe: customVibe || 'Intuitive Pocket',
          harmonicFlavor: 'In-key Harmony',
          clipId: `c_${newId}_1`,
        },
      ],
    };

    onRecruitPlayer(newPlayer, createTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#050814] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#070c1e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center space-x-2">
                <span>RECRUIT SESSION PLAYERS &amp; VOCALISTS</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  THE BAND
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Add real studio session musicians, background vocalists, and instrumentalists that listen and follow your musical intent.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher & Track Link Checkbox */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#080d22] border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'roster'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              Curated Studio Roster ({PRESET_ROSTER.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              + Create Custom Musician / Vocalist
            </button>
          </div>

          <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={createTrack}
              onChange={(e) => setCreateTrack(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Create Dedicated DAW Track in Session</span>
          </label>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'roster' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_ROSTER.map((preset) => {
                const isAlreadyInBand = existingPlayerIds.includes(preset.id);
                return (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isAlreadyInBand
                        ? 'bg-[#090e21]/60 border-slate-800 opacity-80'
                        : 'bg-[#080e24] border-slate-800/90 hover:border-amber-500/60 shadow-md group'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                              {preset.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                              {preset.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {preset.instrument}
                          </div>
                        </div>

                        {isAlreadyInBand && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                            IN BAND
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 font-sans leading-relaxed">
                        {preset.bio}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {preset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="bg-[#050814] p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-0.5">
                        <div className="text-amber-400 font-bold uppercase text-[9px]">
                          Key Directing Rule:
                        </div>
                        <div className="truncate text-slate-300">
                          ▸ {preset.rules[0]}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-slate-400">
                        {preset.takes.length} Initial Realized Take{preset.takes.length > 1 ? 's' : ''}
                      </div>

                      <button
                        onClick={() => handleRecruitPreset(preset)}
                        className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isAlreadyInBand
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAlreadyInBand ? 'Add Another Instance' : 'Recruit to Band'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Musician / Vocalist Builder */
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="bg-[#070d22] border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                      MUSICIAN / VOCALIST NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. TASHA, CARLOS, ZION"
                      className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                      ROLE / DISCIPLINE *
                    </label>
                    <select
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                    >
                      <option value="GUITAR">Guitarist (Electric / Acoustic)</option>
                      <option value="BGV VOCALIST">Background Vocalist (Harmonies)</option>
                      <option value="LEAD VOCALIST">Session Vocalist (Lead &amp; Hook)</option>
                      <option value="KEYS">Keyboardist / Piano / Rhodes</option>
                      <option value="BASS">Bassist (Electric / Upright / Synth)</option>
                      <option value="DRUMS">Drummer (Acoustic / Hybrid)</option>
                      <option value="PERCUSSION">Percussionist (Aux / Shakers / Latin)</option>
                      <option value="STRINGS">Strings (Cello / Violin Ensemble)</option>
                      <option value="BRASS">Brass &amp; Horns (Trumpet / Sax)</option>
                      <option value="SYNTH">Synthesizer &amp; Sound Designer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                      PRIMARY PHYSICAL INSTRUMENT OR VOCAL TYPE
                    </label>
                    <input
                      type="text"
                      value={customInstrument}
                      onChange={(e) => setCustomInstrument(e.target.value)}
                      placeholder="e.g. 1972 Gibson Les Paul, Gospel Tenor Soloist, Upright Gut Bass"
                      className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                      GENRE &amp; VIBE TAGS (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={customTags}
                      onChange={(e) => setCustomTags(e.target.value)}
                      placeholder="e.g. Neo-Soul, Gospel, Laid-back"
                      className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    MUSICIAN PERSONA &amp; PLAYING STYLE (Bio)
                  </label>
                  <textarea
                    value={customBio}
                    onChange={(e) => setCustomBio(e.target.value)}
                    rows={2}
                    placeholder="Describe their feel, harmonic instinct, micro-timing pocket, and how they play in the band..."
                    className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 font-bold block mb-1">
                    ARCHITECTURAL PERFORMANCE RULES (One rule per line)
                  </label>
                  <textarea
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    rows={3}
                    placeholder="e.g. Stay out of lead vocal 200-500Hz lane&#10;Lock with kick drum downbeat&#10;Enter only on chorus sections"
                    className="w-full bg-[#050918] text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    These rules instruct SoulSonus to preserve their boundaries and phrasing across revisions.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {customName.toUpperCase() || 'Player'} to Band</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
