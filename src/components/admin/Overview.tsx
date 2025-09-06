import { Users } from "phosphor-react";
import { BiTrendingUp, BiUserCheck, BiUserX } from "react-icons/bi";
import { FaDollarSign } from "react-icons/fa";
import { useAdminStore } from "@/stores/adminStore";
import { MdOutlineNotificationsPaused } from "react-icons/md";
import Link from "next/link";

const Overview = () => {
  const { campaigns, influencers } = useAdminStore();

  // ✅ Add safety checks for campaigns array
  const safeCampaigns = campaigns && Array.isArray(campaigns) ? campaigns : [];

  const newInfluencer = [...influencers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .at(0);

  // ✅ Use campaigns instead of brands
  const newCampaign = [...safeCampaigns]
    .sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    )
    .at(0);

  const pendingApprovals = influencers.filter(
    (influencer) => influencer.status === "pending"
  );

  // ✅ Use campaigns for payment info
  const newPayment = safeCampaigns
    .filter((campaign) => campaign.hasPaid === true)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || "").getTime() -
        new Date(a.updatedAt || a.createdAt || "").getTime()
    )
    .at(0);

  const recentActivity = newInfluencer || newCampaign || newPayment;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return `${diffSec} sec${diffSec !== 1 ? "s" : ""} ago`;
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    } else if (diffDay === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <div className="space-y-8 mt-8 p-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          {!recentActivity ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 rounded-full bg-gray-100 mb-3">
                <MdOutlineNotificationsPaused className="text-2xl text-gray-400" />
              </div>
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm text-gray-400">
                Try refreshing or check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* for influencer */}
              {newInfluencer && (
                <Link href="/admin/influencers">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <BiUserCheck className="text-blue-600" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New influencer joined!
                      </p>
                      <p className="text-xs text-gray-600">
                        {newInfluencer.name} joined as an influencer
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(newInfluencer.createdAt)}
                    </span>
                  </div>
                </Link>
              )}

              {/* for payment */}
              {newPayment && (
                <Link href="/admin/campaigns">
                  <div className="flex items-center space-x-3 mt-2 p-3 bg-green-50 rounded-lg">
                    <FaDollarSign className="text-green-600" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Campaign payment processed!
                      </p>
                      <p className="text-xs text-gray-600">
                        ₦{newPayment.totalCost?.toLocaleString() || "0"} has
                        been paid for {newPayment.brandName}&apos;s campaign
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(
                        newPayment.updatedAt || newPayment.createdAt || ""
                      )}
                    </span>
                  </div>
                </Link>
              )}

              {/* for new campaign */}
              {newCampaign && (
                <Link href="/admin/campaigns">
                  <div className="flex items-center space-x-3 p-3 mt-2 bg-purple-50 rounded-lg">
                    <BiTrendingUp className="text-purple-600" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New campaign created!
                      </p>
                      <p className="text-xs text-gray-600">
                        {newCampaign.brandName} created a new campaign
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(newCampaign.createdAt || "")}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Approvals
          </h3>
          {pendingApprovals.length > 0 ? (
            <>
              {pendingApprovals.map((user, index) => (
                <Link key={index} href="/admin/influencers">
                  <div className="space-y-3" key={user._id}>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate max-w-[200px]">
                            {user?.niches?.length ? user.niches.join(", ") : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 rounded-full bg-gray-100 mb-3">
                <MdOutlineNotificationsPaused className="text-2xl text-gray-400" />
              </div>
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm text-gray-400">
                Try refreshing or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
