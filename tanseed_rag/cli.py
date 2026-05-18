"""CLI entry point for TANSEED RAG Pipeline."""

import argparse
import json
import sys
import os

from tanseed_rag.pipeline import TanseedPipeline
from tanseed_rag.eligibility import EligibilityChecker
from tanseed_rag.config import GUIDELINES_PATH


def main():
    parser = argparse.ArgumentParser(description="TANSEED RAG Pipeline CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Ingest command
    ingest_parser = subparsers.add_parser("ingest", help="Ingest guidelines into vector store")
    ingest_parser.add_argument("--file", default=GUIDELINES_PATH, help="Path to guidelines markdown file")

    # Query command
    query_parser = subparsers.add_parser("query", help="Query guidelines for information")
    query_parser.add_argument("text", help="Query text")
    query_parser.add_argument("--top_k", type=int, default=5, help="Number of results to return")

    # Check command
    check_parser = subparsers.add_parser("check", help="Check eligibility for a startup")
    check_parser.add_argument("--input", required=True, help="Path to JSON file with startup data")

    # Draft command
    draft_parser = subparsers.add_parser("draft", help="Draft application content")
    draft_parser.add_argument("--input", required=True, help="Path to JSON file with startup data")
    draft_parser.add_argument("--desc", required=True, help="Short project description")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    pipeline = TanseedPipeline()

    if args.command == "ingest":
        count = pipeline.build_index(args.file)
        print(f"Successfully ingested {count} chunks.")

    elif args.command == "query":
        hits = pipeline.query(args.text, top_k=args.top_k)
        print(f"\nResults for: {args.text}\n" + "="*40)
        for i, hit in enumerate(hits):
            print(f"\n[{i+1}] Score: {hit['score']:.4f} | Section: {hit['metadata'].get('section', 'N/A')}")
            print(f"---")
            print(hit['text'])

    elif args.command == "check":
        if not os.path.exists(args.input):
            print(f"Error: Input file not found: {args.input}")
            sys.exit(1)
        
        with open(args.input, "r") as f:
            user_data = json.load(f)
        
        checker = EligibilityChecker(pipeline)
        report = checker.check_eligibility(user_data)
        
        print("\n" + "="*60)
        print(f"TANSEED ELIGIBILITY REPORT")
        print("="*60)
        print(f"OVERALL STATUS: {report['overall_status']}")
        print("-" * 60)
        
        for field, check in report["checks"].items():
            status_symbol = "\u2705" if check["status"] == "PASS" else "\u274c"
            print(f"{status_symbol} {field.upper()}: {check['status']}")
            print(f"   Value: {check['value']}")
            print(f"   Justification: {check['justification']}")
            print("-" * 30)
        
        print(f"\nRECOMMENDATION:\n{report['recommendation']}")
        print("="*60)

    elif args.command == "draft":
        if not os.path.exists(args.input):
            print(f"Error: Input file not found: {args.input}")
            sys.exit(1)
            
        with open(args.input, "r") as f:
            user_data = json.load(f)
            
        checker = EligibilityChecker(pipeline)
        draft = checker.draft_application(user_data, args.desc)
        print("\n" + draft)


if __name__ == "__main__":
    main()
