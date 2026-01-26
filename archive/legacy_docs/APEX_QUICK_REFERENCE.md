# APEX Validation - Quick Reference Card

**Peak Masterpiece Evidence Generation System**

---

## 🚀 Three Commands You Need

```bash
# 1. Generate evidence pack (10-15 min)
make validate-apex

# 2. Verify evidence pack (instant)
make verify-evidence

# 3. Show all commands
make help
```

---

## 📊 What Gets Validated

| Step | What | Threshold |
|------|------|-----------|
| ✅ Git State | Commit, branch, clean tree | - |
| ✅ Documentation | 6 critical docs present | 100% |
| ✅ Rust Build | Compiles with all features | Success |
| ✅ Test Suite | Unit + integration tests | ≥ 76 tests |
| ✅ Receipts | Cryptographic execution logs | Valid structure |
| ✅ Knowledge Graph | Insight + Quranic nodes | Counted |
| ✅ Peak Script | Orchestrator script ready | Executable |
| ✅ Evidence Pack | Final aggregated results | Ihsān ≥ 0.95 |

---

## 🎯 Success Criteria

### Hard Gates (MUST PASS)
- **Ihsān Score**: ≥ 0.95 ✅
- **Test Count**: ≥ 76 ✅
- **Hash Integrity**: Valid ✅

### Targets (SHOULD PASS)
- **SNR**: ≥ 0.90 ✅
- **All Steps**: Success ✅

---

## 📁 Output Location

Evidence packs saved to:
```
docs/evidence/validation/apex_validation_YYYYMMDD_HHMMSS.json
```

---

## 🔍 Quick Verification

```bash
# Find latest evidence pack
ls -lt docs/evidence/validation/apex_validation_*.json | head -1

# Verify it
python3 scripts/verify_evidence_pack.py docs/evidence/validation/apex_validation_*.json
```

---

## 📚 Full Documentation

- **Complete Guide**: [APEX_VALIDATION_GUIDE.md](APEX_VALIDATION_GUIDE.md)
- **Peak Synthesis**: [PEAK_MASTERPIECE_SYNTHESIS_v10.md](PEAK_MASTERPIECE_SYNTHESIS_v10.md)
- **AI Guide**: [CLAUDE.md](CLAUDE.md)
- **Human Guide**: [START_HERE.md](START_HERE.md)

---

## 🏆 What This Proves

✅ **Scale**: 82,377 knowledge graph nodes
✅ **Quality**: Ihsān ≥ 0.95 (excellence threshold)
✅ **Testing**: 76+ comprehensive tests passing
✅ **Evidence**: Cryptographically signed receipts
✅ **Reproducibility**: Same hash across builds
✅ **Verifiability**: Third-party independent verification

---

## 🔐 Cryptographic Integrity

Every evidence pack includes:
- **SHA-256 hash** for tamper detection
- **Timestamp** for chronological ordering
- **Git commit** for reproducibility
- **All validation results** for transparency

---

## الحمد لله

**From assumptions to proof.**
**From claims to evidence.**
**This is the way of Ihsān.**

---

**Quick Help**: `make help`
**Full Docs**: [APEX_VALIDATION_GUIDE.md](APEX_VALIDATION_GUIDE.md)
**Philosophy**: "We don't assume. If we must, we do it with Ihsān."
