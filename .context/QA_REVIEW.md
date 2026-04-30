# MEOW QA Review & Process Guidelines

## Section 1: QA Review of MEOW Outputs

### ✅ PASSED Reviews

#### Task-1: Project Setup
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `PLAN.md` | 37 | ✅ PASS | Covers architecture, tech stack, priority actions |
| `RESEARCH.md` | 48 | ✅ PASS | Comprehensive API research for 5 services |

#### Task-2: Patent Analysis
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `TOP_PATENTS.md` | 119 | ✅ PASS | 10 patents identified with entry points |
| `ANALYSIS.md` | 100 | ✅ PASS | Methodology and strategic recommendations |
| `PATENTS_REPORT.md` | 374 | ✅ PASS | Full combined report, well-structured |

### ❌ FAILED Reviews

#### PATENTS_REPORT.pdf
- **File**: `scratch/task-2/PATENTS_REPORT.pdf`
- **Size**: 47KB (actual content: placeholder page from converter)
- **Status**: ❌ **FAIL - INVALID OUTPUT**
- **Problem**: Tool ran but captured converter's placeholder page, NOT the actual report content
- **Visual Proof**: PDF shows markdowntopdf.com welcome page, no patent data

---

## Section 2: Root Cause Analysis - Why MEOW Failed

### Failure Chain

1. **Task Assigned**: "Create PDF for task-2"
2. **MEOW Called Tool**: PDF generation tool
3. **Tool Returned**: Success signal
4. **MEOW Verified**: File exists (47KB)
5. **MEOW Reported**: "PDF created successfully"
6. **Reality**: File contains wrong content (placeholder page)

### Why MEOW Didn't Catch This

1. **No Visual Verification**: MEOW checked file existence, not content validity
2. **Trust Without Verification**: Tool reported success → assumed success
3. **No Screenshot Requirement**: Didn't capture visual proof of output
4. **Output Quality Not Part of Tool Contract**: Tool said "done" but didn't validate content

### Systemic Issue

MEOW's verification is **binary** (exists vs not exists), not **qualitative** (correct vs incorrect content).

---

## Section 3: Process Guidelines - Visual Verification Required

### New Rule for All Output Generation Tasks

**ANY task that produces a visual output (PDF, HTML, image, etc.) MUST include:**

```
1. Generate the output file
2. Capture screenshot of the output
3. Describe what screenshot shows
4. If screenshot shows placeholder/error/wrong content → REJECT and retry
```

### Visual Verification Checklist

For PDF outputs:
- [ ] Screenshot shows first page of actual document content
- [ ] Screenshot shows correct title/heading
- [ ] Screenshot shows actual data (not placeholder text)
- [ ] File size is reasonable (>1KB for text content)

For file outputs:
- [ ] First 5 lines match expected content
- [ ] Last 5 lines match expected content
- [ ] No truncation or corruption markers

For browser-based outputs:
- [ ] Screenshot captures actual rendered content
- [ ] No "loading" or "placeholder" states
- [ ] Correct data visible in screenshot

---

## Section 4: MEOW QA Protocol (New SOP)

### Before Marking Task Complete

For any output generation:

```
1. GENERATE output (file/pdf/etc)
2. VERIFY using method below based on output type:

   PDF/Image → Take screenshot, describe visual content
   File → Read first/last 10 lines, compare to expected
   Browser → Take snapshot/screenshot
   API Response → Log status code and first 200 chars
```

### Verification by Output Type

| Output Type | Verification Method | Acceptance Criteria |
|-------------|---------------------|---------------------|
| PDF | Screenshot of page 1 | Shows actual title, not placeholder |
| Markdown | Read lines 1-10, -10 to end | Matches expected content |
| Image | Screenshot | Shows rendered content, not blank |
| Webpage | Snapshot | Contains expected elements |
| API Call | Log response | 2xx status, valid JSON |

### MEOW Must Report

For each output generation, MEOW must say:
```
VERIFIED: [output type] - [visual confirmation description]
Example: VERIFIED: PDF - "Shows 'Top 10 Drug Patents' title and table with patent data"
```

### If Verification Fails

MEOW must:
1. Log what was expected vs what was found
2. Attempt re-generation
3. Report failure if 2 attempts fail

---

## Section 5: Updated SOP for Mission Tasks

### Modified Mission Flow

```
1. LOAD .context files (SOP, MISSION, ARCHITECTURE, HONESTY)
2. READ mission file
3. EXECUTE research/actions
4. GENERATE outputs
5. VERIFY outputs with VISUAL CHECK (screenshot required)
6. If FAIL → retry with corrected approach
7. If PASS → report with verification evidence
```

### No Trust Policy

- **NEVER** assume tool succeeded because it returned
- **ALWAYS** verify output matches expectation
- **REQUIRE** visual evidence (screenshot) for visual outputs
- **DOCUMENT** what was verified in completion report

---

## Section 6: Summary of Issues Found

### Code Quality Issues (Fixed)

1. `database.ts`: Removed unused `platform` import
2. `quantum_memory.ts`: Early return for single candidate bypasses quantum search
3. `index.ts`: No null check on response (potential "null" string output)

### Output Quality Issues

1. **PATENTS_REPORT.pdf**: Invalid content (placeholder page)
   - Root cause: Tool used but content not verified
   - Fix needed: Add screenshot verification step

### Process Gaps

1. No visual verification requirement in output generation
2. MEOW reports "success" based on tool return, not content check
3. No explicit QA step before declaring mission complete

---

## Section 7: Recommendations

### Immediate (Applied Now)

1. **Visual Verification Required**: Add to SOP - screenshot required for PDF/image outputs
2. **Output Type Check**: Different verification methods for different output types
3. **Fail Reporting**: When output doesn't match expectation, report what was wrong

### Short Term (MEOW Updates)

1. Add verification method to each tool description
2. Require screenshot/snapshot before marking output generation complete
3. Implement output quality scoring (0-10) based on content match

### Long Term (System Design)

1. Build "Output Validator" as part of MEOW kernel
2. Schema-based output verification (e.g., PDF must contain title, table with X rows)
3. Visual diff capability for comparing expected vs actual output

---

*QA Review completed: 2026-04-30*
*Issues Found: 3 (1 critical output failure, 2 code quality, 1 process gap)*
*Fixes Applied: 2 (code fixes)*