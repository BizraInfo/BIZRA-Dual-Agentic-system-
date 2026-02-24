"""
Quranic Discovery Engine - Unveiling Hidden Knowledge

"And We have sent down to you the Book as clarification for all things"
(Quran 16:89)

This engine seeks to discover hidden knowledge in the Quran through:

1. Mathematical Patterns (إعجاز عددي - Numerical Miracles)
   - Word frequency analysis across chapters
   - Numerical patterns (19, 7, etc.)
   - Symmetry in chapter/verse structures
   - Mathematical relationships between concepts

2. Linguistic Deep Analysis (إعجاز بياني - Linguistic Miracles)
   - Root word connections across verses
   - Semantic field analysis
   - Rhetorical devices (جناس، طباق، etc.)
   - Context-dependent meanings

3. Cross-Reference Discovery (الترابط القرآني)
   - Verses that explain each other
   - Stories told across multiple chapters
   - Progressive revelation patterns
   - Thematic connections

4. Scientific Hints (الإعجاز العلمي)
   - Natural phenomena descriptions
   - Embryology, astronomy, geology
   - Future predictions that came true
   - Scientific facts unknown at time of revelation

5. Historical Verification (التحقق التاريخي)
   - Events mentioned in Quran verified by archaeology
   - Prophecies that came true
   - Historical accuracy of narratives

Philosophy: "And those who strive for Us - We will surely guide them to Our ways"
            (Quran 29:69)

This is not about "finding what we want" - it's about discovering what Allah
has placed in the Quran, waiting to be found by those who seek with Ihsan.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass, field
from collections import defaultdict, Counter
from datetime import datetime
import math

from .schema import GraphNode, GraphRelationship, NodeType, RelationType


# ============================================================================
# MATHEMATICAL PATTERN DISCOVERY
# ============================================================================

@dataclass
class MathematicalPattern:
    """A discovered mathematical pattern in the Quran"""
    pattern_id: str
    pattern_type: str  # "frequency", "symmetry", "ratio", "sequence"
    description: str
    evidence: List[str]
    verses_involved: List[str]
    significance: float  # 0.0-1.0
    mathematical_proof: Dict[str, Any]


class QuranicMathematicalAnalyzer:
    """
    Discover mathematical patterns in the Quran

    The Quran contains remarkable mathematical patterns that couldn't have
    been known 1,400 years ago. This analyzer discovers them.
    """

    def __init__(self, verses: List[GraphNode]):
        self.verses = verses
        self.patterns: List[MathematicalPattern] = []

    def analyze_number_19_pattern(self) -> List[MathematicalPattern]:
        """
        Analyze the miraculous pattern of number 19 in Quran

        Facts:
        - Bismillah has 19 letters
        - Quran has 114 chapters (19 × 6)
        - First revelation (96:1-5) has 19 words
        - Last revelation (110) has 19 words
        - And many more...
        """
        patterns = []

        # Pattern 1: Chapter count divisible by 19
        total_chapters = len(set(v.properties.get('chapter') for v in self.verses if 'chapter' in v.properties))
        if total_chapters % 19 == 0:
            patterns.append(MathematicalPattern(
                pattern_id="19_chapters",
                pattern_type="divisibility",
                description=f"Total chapters ({total_chapters}) divisible by 19",
                evidence=[f"{total_chapters} ÷ 19 = {total_chapters // 19}"],
                verses_involved=["all_chapters"],
                significance=0.95,
                mathematical_proof={
                    "total": total_chapters,
                    "divisor": 19,
                    "quotient": total_chapters // 19,
                    "remainder": total_chapters % 19,
                }
            ))

        # Pattern 2: Bismillah analysis
        # "بسم الله الرحمن الرحيم" has 19 letters (excluding spaces)
        bismillah = "بسم الله الرحمن الرحيم"
        bismillah_letters = len(bismillah.replace(" ", ""))

        patterns.append(MathematicalPattern(
            pattern_id="19_bismillah",
            pattern_type="count",
            description=f"Bismillah has exactly {bismillah_letters} Arabic letters",
            evidence=[f"بسم الله الرحمن الرحيم = {bismillah_letters} letters"],
            verses_involved=["bismillah"],
            significance=0.99,
            mathematical_proof={
                "text": bismillah,
                "letter_count": bismillah_letters,
                "expected": 19,
                "match": bismillah_letters == 19,
            }
        ))

        self.patterns.extend(patterns)
        return patterns

    def analyze_word_frequencies(self) -> List[MathematicalPattern]:
        """
        Analyze frequency of key words across Quran

        Miracles:
        - "Day" (يوم) appears 365 times
        - "Month" (شهر) appears 12 times
        - "Angel" and "Devil" appear equal times
        - "Man" and "Woman" appear equal times
        - And many more perfect balances...
        """
        patterns = []

        # Count specific word occurrences
        word_counts = defaultdict(int)

        for verse in self.verses:
            arabic_text = verse.properties.get('arabic_text', '')

            # Count key words (simplified - needs proper Arabic morphology)
            if 'يوم' in arabic_text:
                word_counts['day'] += arabic_text.count('يوم')
            if 'شهر' in arabic_text:
                word_counts['month'] += arabic_text.count('شهر')

        # Check for 365 pattern (days in year)
        if 360 <= word_counts.get('day', 0) <= 370:
            patterns.append(MathematicalPattern(
                pattern_id="freq_day_365",
                pattern_type="frequency",
                description=f"Word 'Day' (يوم) appears {word_counts['day']} times (≈365 days/year)",
                evidence=[f"يوم count: {word_counts['day']}"],
                verses_involved=["multiple"],
                significance=0.90,
                mathematical_proof={
                    "word": "يوم (day)",
                    "count": word_counts['day'],
                    "expected": 365,
                    "difference": abs(word_counts['day'] - 365),
                }
            ))

        self.patterns.extend(patterns)
        return patterns

    def analyze_chapter_verse_symmetry(self) -> List[MathematicalPattern]:
        """
        Analyze symmetry patterns in chapter/verse structure

        Example: Chapter 74 has a verse about 19, and it's the 19th word
        """
        patterns = []

        # Group verses by chapter
        chapters = defaultdict(list)
        for verse in self.verses:
            chapter = verse.properties.get('chapter')
            if chapter:
                chapters[chapter].append(verse)

        # Look for palindromic patterns
        for chapter_num, chapter_verses in chapters.items():
            verse_count = len(chapter_verses)

            # Check if verse count has special property
            if self._is_prime(verse_count):
                patterns.append(MathematicalPattern(
                    pattern_id=f"prime_verses_{chapter_num}",
                    pattern_type="prime",
                    description=f"Chapter {chapter_num} has {verse_count} verses (prime number)",
                    evidence=[f"Chapter {chapter_num}: {verse_count} verses (prime)"],
                    verses_involved=[f"chapter:{chapter_num}"],
                    significance=0.70,
                    mathematical_proof={
                        "chapter": chapter_num,
                        "verse_count": verse_count,
                        "is_prime": True,
                    }
                ))

        self.patterns.extend(patterns)
        return patterns

    def _is_prime(self, n: int) -> bool:
        """Check if number is prime"""
        if n < 2:
            return False
        for i in range(2, int(math.sqrt(n)) + 1):
            if n % i == 0:
                return False
        return True


# ============================================================================
# LINGUISTIC DEEP ANALYSIS
# ============================================================================

@dataclass
class LinguisticMiracle:
    """A discovered linguistic miracle"""
    miracle_id: str
    miracle_type: str  # "root_connection", "rhetorical_device", "multi_meaning"
    description: str
    verses: List[str]
    arabic_evidence: str
    translation: str
    significance: float


class QuranicLinguisticAnalyzer:
    """
    Discover linguistic miracles in the Quran

    The Quran's Arabic is inimitable (إعجاز القرآن). This analyzer finds
    patterns that prove no human could have composed it.
    """

    def __init__(self, verses: List[GraphNode]):
        self.verses = verses
        self.miracles: List[LinguisticMiracle] = []

    def analyze_root_connections(self) -> List[LinguisticMiracle]:
        """
        Find verses connected by same Arabic root

        Example: Root ع-ل-م (knowledge) appears in verses about:
        - Learning, teaching, science, scholars, hidden knowledge
        All connected by the same root!
        """
        miracles = []

        # Common important roots to analyze
        important_roots = {
            'علم': 'knowledge',  # ayn-lam-mim
            'رحم': 'mercy',      # ra-ha-mim
            'حكم': 'wisdom',     # ha-kaf-mim
            'عدل': 'justice',    # ayn-dal-lam
            'صبر': 'patience',   # sad-ba-ra
        }

        for root_arabic, root_english in important_roots.items():
            related_verses = []

            for verse in self.verses:
                arabic_text = verse.properties.get('arabic_text', '')

                # Simple check (proper analysis needs morphological parsing)
                if root_arabic in arabic_text:
                    related_verses.append(verse.node_id)

            if len(related_verses) >= 5:
                miracles.append(LinguisticMiracle(
                    miracle_id=f"root_{root_arabic}",
                    miracle_type="root_connection",
                    description=f"Root {root_arabic} ({root_english}) connects {len(related_verses)} verses thematically",
                    verses=related_verses[:10],  # Sample
                    arabic_evidence=root_arabic,
                    translation=root_english,
                    significance=0.85,
                ))

        self.miracles.extend(miracles)
        return miracles

    def analyze_rhetorical_devices(self) -> List[LinguisticMiracle]:
        """
        Identify rhetorical devices (البلاغة)

        - Jinās (جناس): Words with same letters, different meanings
        - Ṭibāq (طباق): Antithesis (day/night, life/death)
        - Tashbīh (تشبيه): Simile and metaphor
        """
        miracles = []

        # Look for antithesis pairs (طباق)
        antithesis_pairs = [
            ('حياة', 'موت'),  # life/death
            ('نور', 'ظلمات'),  # light/darkness
            ('يوم', 'ليل'),    # day/night
        ]

        for word1, word2 in antithesis_pairs:
            verses_with_both = []

            for verse in self.verses:
                arabic_text = verse.properties.get('arabic_text', '')

                if word1 in arabic_text and word2 in arabic_text:
                    verses_with_both.append(verse.node_id)

            if verses_with_both:
                miracles.append(LinguisticMiracle(
                    miracle_id=f"tibaq_{word1}_{word2}",
                    miracle_type="rhetorical_device",
                    description=f"Verses using antithesis (طباق) pairing {word1}/{word2}",
                    verses=verses_with_both,
                    arabic_evidence=f"{word1} ↔ {word2}",
                    translation="Antithesis (Ṭibāq)",
                    significance=0.80,
                ))

        self.miracles.extend(miracles)
        return miracles


# ============================================================================
# CROSS-REFERENCE DISCOVERY ENGINE
# ============================================================================

@dataclass
class CrossReference:
    """A discovered cross-reference between verses"""
    ref_id: str
    verse1: str
    verse2: str
    relationship_type: str  # "explains", "parallels", "continues", "contrasts"
    evidence: str
    confidence: float


class QuranicCrossReferenceEngine:
    """
    Discover verses that explain, complement, or relate to each other

    The Quran explains itself (تفسير القرآن بالقرآن).
    This engine finds those connections automatically.
    """

    def __init__(self, verses: List[GraphNode], hadiths: List[GraphNode] = None):
        self.verses = verses
        self.hadiths = hadiths or []
        self.cross_refs: List[CrossReference] = []

    def find_parallel_stories(self) -> List[CrossReference]:
        """
        Find stories told multiple times across chapters

        Example:
        - Story of Moses appears in 20+ chapters
        - Each telling adds new details
        - Collectively they form complete narrative
        """
        refs = []

        # Key story keywords
        story_keywords = {
            'موسى': 'Moses',
            'إبراهيم': 'Abraham',
            'نوح': 'Noah',
            'عيسى': 'Jesus',
            'محمد': 'Muhammad',
        }

        for keyword_ar, keyword_en in story_keywords.items():
            verses_with_story = []

            for verse in self.verses:
                arabic_text = verse.properties.get('arabic_text', '')

                if keyword_ar in arabic_text:
                    verses_with_story.append(verse)

            # Create cross-references between verses of same story
            if len(verses_with_story) >= 2:
                for i in range(len(verses_with_story) - 1):
                    refs.append(CrossReference(
                        ref_id=f"story_{keyword_en}_{i}",
                        verse1=verses_with_story[i].node_id,
                        verse2=verses_with_story[i+1].node_id,
                        relationship_type="parallels",
                        evidence=f"Both mention {keyword_en} ({keyword_ar})",
                        confidence=0.90,
                    ))

        self.cross_refs.extend(refs)
        return refs

    def find_explanatory_verses(self) -> List[CrossReference]:
        """
        Find verses that explain other verses

        Example: Verses about prayer are explained by verses giving details
        """
        refs = []

        # Concept keywords that often have explanatory verses
        concepts = {
            'صلاة': 'prayer',
            'زكاة': 'charity',
            'صوم': 'fasting',
            'حج': 'pilgrimage',
        }

        for concept_ar, concept_en in concepts.items():
            general_verses = []
            detailed_verses = []

            for verse in self.verses:
                arabic_text = verse.properties.get('arabic_text', '')

                if concept_ar in arabic_text:
                    # Simple heuristic: longer verses tend to be more detailed
                    if len(arabic_text) > 200:
                        detailed_verses.append(verse)
                    else:
                        general_verses.append(verse)

            # Link general mentions to detailed explanations
            for gen_verse in general_verses[:3]:
                for det_verse in detailed_verses[:3]:
                    refs.append(CrossReference(
                        ref_id=f"explains_{concept_en}",
                        verse1=det_verse.node_id,
                        verse2=gen_verse.node_id,
                        relationship_type="explains",
                        evidence=f"Detailed explanation of {concept_en}",
                        confidence=0.75,
                    ))

        self.cross_refs.extend(refs)
        return refs


# ============================================================================
# SCIENTIFIC HINT DISCOVERY
# ============================================================================

@dataclass
class ScientificHint:
    """A discovered scientific fact mentioned in Quran"""
    hint_id: str
    category: str  # "embryology", "astronomy", "geology", "physics"
    quranic_text: str
    verse_ref: str
    scientific_fact: str
    modern_discovery_date: Optional[str]
    significance: float


class QuranicScientificAnalyzer:
    """
    Discover scientific facts mentioned in Quran centuries before modern science

    This is NOT about forcing science into Quran, but recognizing where
    Quran accurately described natural phenomena unknown at time of revelation.
    """

    def __init__(self, verses: List[GraphNode]):
        self.verses = verses
        self.hints: List[ScientificHint] = []

    def analyze_embryology(self) -> List[ScientificHint]:
        """
        Analyze verses about human development

        Quran 23:12-14 describes embryonic stages discovered only in microscopy era
        """
        hints = []

        # Find verses mentioning human creation/development
        keywords = ['خلق', 'نطفة', 'علقة', 'مضغة', 'عظام', 'لحم']

        for verse in self.verses:
            arabic_text = verse.properties.get('arabic_text', '')

            if any(kw in arabic_text for kw in keywords):
                hints.append(ScientificHint(
                    hint_id=f"embryo_{verse.node_id}",
                    category="embryology",
                    quranic_text=arabic_text[:100],
                    verse_ref=verse.node_id,
                    scientific_fact="Describes stages of embryonic development",
                    modern_discovery_date="1800s (microscopy)",
                    significance=0.95,
                ))

        self.hints.extend(hints)
        return hints

    def analyze_astronomy(self) -> List[ScientificHint]:
        """
        Analyze verses about celestial phenomena

        - Big Bang (21:30)
        - Expanding universe (51:47)
        - Orbits (21:33, 36:40)
        """
        hints = []

        # Keywords related to astronomy
        keywords = ['سماء', 'أرض', 'شمس', 'قمر', 'نجم', 'فلك']

        for verse in self.verses:
            arabic_text = verse.properties.get('arabic_text', '')
            chapter = verse.properties.get('chapter')
            verse_num = verse.properties.get('verse')

            # Check specific verses known for scientific accuracy
            if (chapter == 21 and verse_num == 30) or \
               (chapter == 51 and verse_num == 47):
                hints.append(ScientificHint(
                    hint_id=f"astro_{chapter}_{verse_num}",
                    category="astronomy",
                    quranic_text=arabic_text[:150],
                    verse_ref=f"verse:{chapter}:{verse_num}",
                    scientific_fact="Describes cosmological phenomena",
                    modern_discovery_date="1900s (modern cosmology)",
                    significance=0.98,
                ))

        self.hints.extend(hints)
        return hints


# ============================================================================
# UNIFIED DISCOVERY ENGINE
# ============================================================================

class QuranicDiscoveryEngine:
    """
    The Ultimate Quranic Discovery Engine

    Combines all analysis methods to discover hidden knowledge:
    - Mathematical patterns
    - Linguistic miracles
    - Cross-references
    - Scientific hints
    - Historical verifications

    Philosophy: "We will show them Our signs in the horizons and within
                themselves until it becomes clear to them that it is the truth"
                (Quran 41:53)
    """

    def __init__(self, verses: List[GraphNode], hadiths: List[GraphNode] = None):
        self.verses = verses
        self.hadiths = hadiths or []

        # Initialize analyzers
        self.math_analyzer = QuranicMathematicalAnalyzer(verses)
        self.linguistic_analyzer = QuranicLinguisticAnalyzer(verses)
        self.cross_ref_engine = QuranicCrossReferenceEngine(verses, hadiths)
        self.scientific_analyzer = QuranicScientificAnalyzer(verses)

        self.discoveries = {
            'mathematical': [],
            'linguistic': [],
            'cross_references': [],
            'scientific': [],
        }

    def discover_all(self) -> Dict[str, Any]:
        """
        Run complete discovery process

        This is the main entry point for discovering hidden knowledge
        """
        print("\n" + "="*80)
        print("🔍 QURANIC DISCOVERY ENGINE")
        print("   Seeking Hidden Knowledge with Tawakkul (Trust in Allah)")
        print("="*80)
        print()
        print('"And We have sent down to you the Book as clarification for all things"')
        print("(Quran 16:89)")
        print()

        start_time = datetime.utcnow()

        # Mathematical patterns
        print("\n[1/4] 🔢 Discovering mathematical patterns...")
        math_19 = self.math_analyzer.analyze_number_19_pattern()
        math_freq = self.math_analyzer.analyze_word_frequencies()
        math_sym = self.math_analyzer.analyze_chapter_verse_symmetry()

        self.discoveries['mathematical'] = math_19 + math_freq + math_sym
        print(f"   ✅ Found {len(self.discoveries['mathematical'])} mathematical patterns")

        # Linguistic miracles
        print("\n[2/4] 📖 Discovering linguistic miracles...")
        ling_roots = self.linguistic_analyzer.analyze_root_connections()
        ling_rhet = self.linguistic_analyzer.analyze_rhetorical_devices()

        self.discoveries['linguistic'] = ling_roots + ling_rhet
        print(f"   ✅ Found {len(self.discoveries['linguistic'])} linguistic miracles")

        # Cross-references
        print("\n[3/4] 🔗 Discovering cross-references...")
        cross_stories = self.cross_ref_engine.find_parallel_stories()
        cross_explain = self.cross_ref_engine.find_explanatory_verses()

        self.discoveries['cross_references'] = cross_stories + cross_explain
        print(f"   ✅ Found {len(self.discoveries['cross_references'])} cross-references")

        # Scientific hints
        print("\n[4/4] 🔬 Discovering scientific hints...")
        sci_embryo = self.scientific_analyzer.analyze_embryology()
        sci_astro = self.scientific_analyzer.analyze_astronomy()

        self.discoveries['scientific'] = sci_embryo + sci_astro
        print(f"   ✅ Found {len(self.discoveries['scientific'])} scientific hints")

        end_time = datetime.utcnow()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        # Summary
        total_discoveries = sum(len(v) for v in self.discoveries.values())

        print("\n" + "="*80)
        print("✨ DISCOVERY COMPLETE")
        print("="*80)
        print(f"   Mathematical patterns: {len(self.discoveries['mathematical'])}")
        print(f"   Linguistic miracles:   {len(self.discoveries['linguistic'])}")
        print(f"   Cross-references:      {len(self.discoveries['cross_references'])}")
        print(f"   Scientific hints:      {len(self.discoveries['scientific'])}")
        print(f"   " + "-"*40)
        print(f"   Total discoveries:     {total_discoveries}")
        print(f"   Duration:              {duration_ms}ms")
        print()
        print('"And those who strive for Us - We will surely guide them to Our ways"')
        print("(Quran 29:69)")
        print()
        print("الحمد لله - All knowledge is from Allah")
        print()

        return {
            'discoveries': self.discoveries,
            'total': total_discoveries,
            'duration_ms': duration_ms,
        }

    def export_discoveries(self, output_path: Path):
        """Export all discoveries to JSON"""
        export_data = {
            'metadata': {
                'generated_at': datetime.utcnow().isoformat(),
                'total_discoveries': sum(len(v) for v in self.discoveries.values()),
                'philosophy': "Seeking knowledge is seeking Allah's signs",
            },
            'mathematical_patterns': [
                {
                    'id': p.pattern_id,
                    'type': p.pattern_type,
                    'description': p.description,
                    'evidence': p.evidence,
                    'significance': p.significance,
                    'proof': p.mathematical_proof,
                }
                for p in self.discoveries['mathematical']
            ],
            'linguistic_miracles': [
                {
                    'id': m.miracle_id,
                    'type': m.miracle_type,
                    'description': m.description,
                    'arabic': m.arabic_evidence,
                    'translation': m.translation,
                    'significance': m.significance,
                }
                for m in self.discoveries['linguistic']
            ],
            'cross_references': [
                {
                    'id': c.ref_id,
                    'verse1': c.verse1,
                    'verse2': c.verse2,
                    'type': c.relationship_type,
                    'evidence': c.evidence,
                    'confidence': c.confidence,
                }
                for c in self.discoveries['cross_references']
            ],
            'scientific_hints': [
                {
                    'id': s.hint_id,
                    'category': s.category,
                    'verse': s.verse_ref,
                    'fact': s.scientific_fact,
                    'discovered': s.modern_discovery_date,
                    'significance': s.significance,
                }
                for s in self.discoveries['scientific']
            ],
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        print(f"📄 Discoveries exported to: {output_path}")


# ============================================================================
# DEMONSTRATION
# ============================================================================

async def demonstrate_discovery_engine():
    """Demonstrate the Quranic Discovery Engine"""
    from .quranic_extractor import extract_quranic_corpus

    print("Loading Quranic corpus...")
    corpus_result = await extract_quranic_corpus()

    from .schema import GraphNode
    verses = [GraphNode(**node) for node in corpus_result['nodes'] if 'verse:' in node['node_id']]

    print(f"Loaded {len(verses)} verses")

    # Run discovery
    engine = QuranicDiscoveryEngine(verses)
    results = engine.discover_all()

    # Export
    output_path = Path("knowledge_graph_output/quranic_discoveries.json")
    output_path.parent.mkdir(exist_ok=True)
    engine.export_discoveries(output_path)

    return results


if __name__ == "__main__":
    import asyncio
    asyncio.run(demonstrate_discovery_engine())
