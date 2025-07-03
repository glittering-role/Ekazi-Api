import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { searchUsersStream } from "./subs/search_users";
import { searchServicesStream } from "./subs/search_services";
import { searchJobSubCategoriesStream } from "./subs/search_job_subcategories";
import { searchJobCategoriesStream } from "./subs/search_job_categories";

async function integratedSearch(req: Request, res: Response) {
    try {
        const query: string = req.query.q as string;

        if (!query || !query.trim()) {
            return res.status(400).json(createResponse(false, "Query parameter is required", {}));
        }

        // Perform searches
        const [
            userResults,
            serviceResults,
            jobCategoryResults,
            jobSubCategoryResults
        ] = await Promise.all([
            searchUsersStream(query),
            searchServicesStream(query),
            searchJobCategoriesStream(query),
            searchJobSubCategoriesStream(query),
        ]);

        // ✅ Safe handling of null results
        const results: any = {};

        if (userResults && userResults.length > 0) results.users = userResults;
        if (serviceResults && serviceResults.length > 0) {
            results.services = serviceResults.map((result: any) => ({ ...result, source: "Services" }));
        }
        if (jobCategoryResults && jobCategoryResults.length > 0) {
            results.jobCategories = jobCategoryResults.map((result: any) => ({ ...result, source: "JobCategory" }));
        }
        if (jobSubCategoryResults && jobSubCategoryResults.length > 0) {
            results.jobSubCategories = jobSubCategoryResults.map((result: any) => ({ ...result, source: "JobSubCategory" }));
        }

        // ✅ If all results are empty, return an empty response
        if (Object.keys(results).length === 0) {
            return res.status(200).json(createResponse(true, "No results found", {}));
        }

        return res.status(200).json(createResponse(true, "Results found", results));
    } catch (error) {
        handleError(error, req, res, "An error occurred during the search operation");
    }
}
export { integratedSearch };
