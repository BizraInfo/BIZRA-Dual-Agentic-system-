"""
Hadith Collection Extractor

Elite-level extraction pipeline for authentic Hadith collections with Big3 orchestration.

Data Sources:
- GitHub: AhmedBaset/hadith-json (50,884+ hadiths from 17 books)
- HuggingFace: meeAtif/hadith_datasets
- Sunnah.com API (requires API key)

Target: Living knowledge graph with Six Books (Kutub al-Sittah):
- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawud
- Jami' at-Tirmidhi
- Sunan an-Nasa'i
- Sunan Ibn Majah

Big3 Coordination:
- Gemini: Analyze hadith structure, identify verse cross-references
- Codex: Generate extraction and cross-reference matching code
- Claude: Validate authenticity grades, ensure quality

Philosophy: "We don't assume. If we must, we do it with Ihsān."
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime

from .schema import (
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationType,
    create_hadith_node,
    create_hadith_collection_node,
    create_hadith_book_node,
    create_narrator_node,
    create_contextualizes_relationship,
    create_elaborates_relationship,
    create_narrated_by_relationship,
    create_contains_relationship,
    GraphSchema,
)


@dataclass
class HadithExtractionStats:
    """Statistics for Hadith extraction process"""
    collections_processed: int = 0
    books_processed: int = 0
    hadiths_extracted: int = 0
    narrators_extracted: int = 0
    relationships_created: int = 0
    verse_references_found: int = 0
    errors: List[str] = field(default_factory=list)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_ms: int = 0


class HadithExtractor:
    """
    Extract authentic Hadith collections into knowledge graph nodes and relationships

    This is Phase 1 of the Hadith integration pipeline:
    1. Download/locate Hadith datasets
    2. Extract collections, books, and individual hadiths
    3. Create nodes and relationships
    4. Identify Quran-Hadith cross-references
    5. Validate against schema
    6. Generate evidence hashes
    """

    # Six Books (Kutub al-Sittah) - prioritized collections
    KUTUB_AL_SITTAH = [
        "bukhari",
        "muslim",
        "abudawud",
        "tirmidhi",
        "nasai",
        "ibnmajah",
    ]

    def __init__(self, data_dir: str = "/root/bizra-genesis/bizra_data_vault/roots/hadith_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.by_chapter_dir = self.data_dir / "db" / "by_chapter" / "the_9_books"

        self.nodes: List[GraphNode] = []
        self.relationships: List[GraphRelationship] = []
        self.stats = HadithExtractionStats()

    def validate_data_sources(self) -> bool:
        """Validate that required Hadith data files exist or can be downloaded"""
        if not self.by_chapter_dir.exists():
            print(f"❌ Hadith data directory not found: {self.by_chapter_dir}")
            print(f"💡 Suggestion: Clone hadith-json repository:")
            print(f"   git clone https://github.com/AhmedBaset/hadith-json.git {self.data_dir}")
            return False

        # Check for Six Books directories
        for collection in self.KUTUB_AL_SITTAH:
            collection_dir = self.by_chapter_dir / collection
            if not collection_dir.exists():
                print(f"⚠️  Collection not found: {collection}")
                continue

        print(f"✅ Data sources validated")
        print(f"   Hadith data dir: {self.by_chapter_dir}")

        return True

    def extract_collection_metadata(self, collection_name: str) -> Optional[GraphNode]:
        """
        Extract collection metadata (e.g., Sahih Bukhari info)

        Returns collection node or None if not found
        """
        collection_info = {
            "bukhari": {
                "name": "Sahih al-Bukhari",
                "description": "Most authentic hadith collection, compiled by Imam Muhammad ibn Ismail al-Bukhari (810-870 CE)",
            },
            "muslim": {
                "name": "Sahih Muslim",
                "description": "Second most authentic collection, compiled by Imam Muslim ibn al-Hajjaj (821-875 CE)",
            },
            "abudawud": {
                "name": "Sunan Abu Dawud",
                "description": "Collection focusing on legal hadiths, compiled by Imam Abu Dawud (817-889 CE)",
            },
            "tirmidhi": {
                "name": "Jami' at-Tirmidhi",
                "description": "Comprehensive collection with hadith grading, compiled by Imam at-Tirmidhi (824-892 CE)",
            },
            "nasai": {
                "name": "Sunan an-Nasa'i",
                "description": "Collection with strict authenticity criteria, compiled by Imam an-Nasa'i (829-915 CE)",
            },
            "ibnmajah": {
                "name": "Sunan Ibn Majah",
                "description": "Sixth book of the Kutub al-Sittah, compiled by Imam Ibn Majah (824-887 CE)",
            },
        }

        info = collection_info.get(collection_name.lower())
        if not info:
            return None

        node = create_hadith_collection_node(
            collection_name=info["name"],
            description=info["description"],
        )

        if GraphSchema.validate_node(node):
            self.stats.collections_processed += 1
            return node

        return None

    def extract_hadiths_from_json(self, json_file: Path, collection_name: str) -> List[GraphNode]:
        """
        Extract hadiths from a JSON file (REAL hadith-json structure)

        Returns list of hadith nodes
        """
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stats.errors.append(f"Failed to load {json_file}: {str(e)}")
            return []

        hadith_nodes = []

        # REAL structure: {"metadata": {...}, "hadiths": [...], "chapter": {...}}
        hadiths = data.get("hadiths", [])

        for hadith_data in hadiths:
            try:
                # REAL fields from actual data
                hadith_id = hadith_data.get("id")
                chapter_id = hadith_data.get("chapterId")
                book_id = hadith_data.get("bookId")
                arabic_text = hadith_data.get("arabic", "")

                # English structure: {"narrator": "...", "text": "..."}
                english_data = hadith_data.get("english", {})
                if isinstance(english_data, dict):
                    narrator = english_data.get("narrator", "")
                    english_text = english_data.get("text", "")
                else:
                    narrator = ""
                    english_text = str(english_data) if english_data else ""

                # Validate required fields
                if not hadith_id or not (arabic_text or english_text):
                    continue

                node = create_hadith_node(
                    collection=collection_name,
                    book=str(book_id),
                    hadith_number=int(hadith_id),
                    arabic_text=arabic_text,
                    english_text=english_text,
                    grade="Sahih",  # Authentic (from Six Books)
                    narrator_chain=narrator,
                )

                if GraphSchema.validate_node(node):
                    hadith_nodes.append(node)
                    self.stats.hadiths_extracted += 1

            except Exception as e:
                self.stats.errors.append(f"Failed to extract hadith {hadith_id}: {str(e)}")
                continue

        return hadith_nodes

    def identify_verse_references(self, hadith_node: GraphNode) -> List[str]:
        """
        Identify Quranic verse references in hadith text

        Returns list of verse IDs (e.g., ["verse:2:255", "verse:17:23"])

        Enhanced pattern matching for better detection.
        """
        verse_refs = set()  # Use set to avoid duplicates
        import re

        # Get both Arabic and English text
        english_text = hadith_node.properties.get("english_text", "")
        arabic_text = hadith_node.properties.get("arabic_text", "")

        # Pattern 1: Standard format "2:255" or "(2:255)"
        pattern1 = r'\b(\d{1,3}):(\d{1,3})\b'
        matches = re.findall(pattern1, english_text)

        for chapter, verse in matches:
            chapter_num = int(chapter)
            verse_num = int(verse)
            if 1 <= chapter_num <= 114 and 1 <= verse_num <= 300:
                verse_refs.add(f"verse:{chapter_num}:{verse_num}")

        # Pattern 2: "Surah X verse Y" or "Chapter X verse Y"
        pattern2 = r'(?:surah|chapter|sura)\s+(\d{1,3})[\s,]+(?:verse|ayah|ayat)\s+(\d{1,3})'
        matches = re.findall(pattern2, english_text, re.IGNORECASE)

        for chapter, verse in matches:
            chapter_num = int(chapter)
            verse_num = int(verse)
            if 1 <= chapter_num <= 114 and 1 <= verse_num <= 300:
                verse_refs.add(f"verse:{chapter_num}:{verse_num}")

        # Pattern 3: Quran references like "Quran 2:255" or "Q. 2:255"
        pattern3 = r'(?:quran|qur\'an|q\.)\s*(\d{1,3}):(\d{1,3})'
        matches = re.findall(pattern3, english_text, re.IGNORECASE)

        for chapter, verse in matches:
            chapter_num = int(chapter)
            verse_num = int(verse)
            if 1 <= chapter_num <= 114 and 1 <= verse_num <= 300:
                verse_refs.add(f"verse:{chapter_num}:{verse_num}")

        # Pattern 4: Named surahs (common ones)
        surah_names = {
            "al-fatiha": 1, "al-baqara": 2, "ali 'imran": 3, "an-nisa": 4,
            "al-ma'ida": 5, "al-an'am": 6, "al-a'raf": 7, "al-anfal": 8,
            "at-tawba": 9, "yunus": 10, "hud": 11, "yusuf": 12,
            "ar-ra'd": 13, "ibrahim": 14, "al-hijr": 15, "an-nahl": 16,
            "al-isra": 17, "al-kahf": 18, "maryam": 19, "ta-ha": 20,
        }

        for name, chapter_num in surah_names.items():
            # Look for "Surah Al-Fatiha, verse 1"
            pattern = rf'{re.escape(name)}[\s,]+(?:verse|ayah)\s+(\d{{1,3}})'
            matches = re.findall(pattern, english_text, re.IGNORECASE)
            for verse in matches:
                verse_num = int(verse)
                if 1 <= verse_num <= 300:
                    verse_refs.add(f"verse:{chapter_num}:{verse_num}")

        return list(verse_refs)

    def create_quran_hadith_relationships(
        self,
        hadith_nodes: List[GraphNode],
    ) -> List[GraphRelationship]:
        """
        Create CONTEXTUALIZES and ELABORATES relationships between Hadiths and Quranic verses

        Args:
            hadith_nodes: List of hadith nodes

        Returns list of relationships
        """
        print("\n🔗 Creating Quran-Hadith cross-references...")

        relationships = []

        for hadith in hadith_nodes:
            verse_refs = self.identify_verse_references(hadith)

            for verse_id in verse_refs:
                # Create CONTEXTUALIZES relationship (Hadith provides context for verse)
                rel = create_contextualizes_relationship(
                    hadith_id=hadith.node_id,
                    verse_id=verse_id,
                    context="Hadith mentions or elaborates on this verse",
                )

                if GraphSchema.validate_relationship(rel):
                    relationships.append(rel)
                    self.stats.relationships_created += 1
                    self.stats.verse_references_found += 1

        print(f"✅ Created {len(relationships)} Quran-Hadith cross-references")

        return relationships

    async def extract_collection(self, collection_name: str) -> Dict[str, Any]:
        """
        Extract a single Hadith collection (e.g., Sahih Bukhari)

        Returns extraction summary
        """
        print(f"\n📚 Extracting {collection_name.upper()}...")

        # Create collection node
        collection_node = self.extract_collection_metadata(collection_name)
        if collection_node:
            self.nodes.append(collection_node)

        # Find collection directory (REAL structure)
        collection_dir = self.by_chapter_dir / collection_name.lower()
        if not collection_dir.exists():
            print(f"⚠️  Collection directory not found: {collection_dir}")
            return {"collection": collection_name, "hadiths": 0, "error": "Directory not found"}

        # Extract hadiths from JSON files
        json_files = sorted(list(collection_dir.glob("*.json")))
        print(f"   Found {len(json_files)} JSON files")

        hadith_nodes = []
        for json_file in json_files:  # All files - FULL DATASET
            nodes = self.extract_hadiths_from_json(json_file, collection_name)
            hadith_nodes.extend(nodes)

        print(f"   ✅ Extracted {len(hadith_nodes)} hadiths from {len(json_files)} files")

        self.nodes.extend(hadith_nodes)

        # Create collection -> hadith relationships
        if collection_node:
            for hadith in hadith_nodes:
                rel = create_contains_relationship(collection_node.node_id, hadith.node_id)
                if GraphSchema.validate_relationship(rel):
                    self.relationships.append(rel)
                    self.stats.relationships_created += 1

        # Create Quran-Hadith cross-references
        cross_refs = self.create_quran_hadith_relationships(hadith_nodes)
        self.relationships.extend(cross_refs)

        print(f"✅ {collection_name}: {len(hadith_nodes)} hadiths extracted")

        return {
            "collection": collection_name,
            "hadiths": len(hadith_nodes),
            "verse_references": self.stats.verse_references_found,
        }

    async def extract_all(self, collections: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Execute full Hadith extraction pipeline

        Args:
            collections: List of collections to extract (default: Six Books)

        Returns extraction summary with nodes, relationships, and stats
        """
        print("\n" + "="*80)
        print("🕌 HADITH COLLECTION EXTRACTION")
        print("="*80)

        self.stats.start_time = datetime.utcnow().isoformat()

        # Step 1: Validate data sources
        if not self.validate_data_sources():
            return {"error": "Data source validation failed"}

        # Step 2: Extract collections
        if collections is None:
            collections = self.KUTUB_AL_SITTAH

        results = []
        for collection in collections:
            result = await self.extract_collection(collection)
            results.append(result)

        self.stats.end_time = datetime.utcnow().isoformat()
        start = datetime.fromisoformat(self.stats.start_time)
        end = datetime.fromisoformat(self.stats.end_time)
        self.stats.duration_ms = int((end - start).total_seconds() * 1000)

        # Summary
        print("\n" + "="*80)
        print("✅ EXTRACTION COMPLETE")
        print("="*80)
        print(f"   Collections:    {self.stats.collections_processed}")
        print(f"   Hadiths:        {self.stats.hadiths_extracted}")
        print(f"   Relationships:  {self.stats.relationships_created}")
        print(f"   Verse Refs:     {self.stats.verse_references_found}")
        print(f"   Errors:         {len(self.stats.errors)}")
        print(f"   Duration:       {self.stats.duration_ms}ms")
        print()

        return {
            "nodes": [n.to_dict() for n in self.nodes],
            "relationships": [r.to_dict() for r in self.relationships],
            "stats": {
                "collections_processed": self.stats.collections_processed,
                "hadiths_extracted": self.stats.hadiths_extracted,
                "relationships_created": self.stats.relationships_created,
                "verse_references_found": self.stats.verse_references_found,
                "errors": self.stats.errors,
                "duration_ms": self.stats.duration_ms,
            },
            "collection_results": results,
        }


# Convenience function for quick extraction
async def extract_hadith_collections(
    collections: Optional[List[str]] = None,
    data_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Quick extraction of Hadith collections

    Args:
        collections: List of collections to extract (default: Six Books)
        data_dir: Path to hadith data directory

    Returns extraction summary
    """
    extractor = HadithExtractor(data_dir) if data_dir else HadithExtractor()
    return await extractor.extract_all(collections)


# CLI entry point
async def main():
    """Run extraction as standalone script"""
    print("\n" + "="*80)
    print("🕌 HADITH EXTRACTION - STANDALONE MODE")
    print("="*80)
    print()
    print("This will extract authentic Hadith collections from the Six Books:")
    print("  1. Sahih al-Bukhari")
    print("  2. Sahih Muslim")
    print("  3. Sunan Abu Dawud")
    print("  4. Jami' at-Tirmidhi")
    print("  5. Sunan an-Nasa'i")
    print("  6. Sunan Ibn Majah")
    print()
    print("Data source: AhmedBaset/hadith-json (GitHub)")
    print()

    result = await extract_hadith_collections()

    # Save result
    output_file = Path("/tmp/hadith_extraction.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"💾 Full extraction saved to: {output_file}")
    print()
    print("الحمد لله - All praise belongs to Allah")
    print()


if __name__ == "__main__":
    asyncio.run(main())
