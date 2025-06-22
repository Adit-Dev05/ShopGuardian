import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Globe, Shield, TrendingUp } from "lucide-react";

interface RiskAnalysis {
  highRiskIPs: string[];
  suspiciousPatterns: Array<{
    type: string;
    ip: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  threatScore: number;
}

interface GeoAnalytics {
  topCountries: Array<{ country: string; count: number }>;
  suspiciousLocations: any[];
}

export default function AdvancedAnalytics() {
  const { data: riskData, isLoading: riskLoading } = useQuery<RiskAnalysis>({
    queryKey: ['/api/analytics/risk'],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });

  const { data: geoData, isLoading: geoLoading } = useQuery<GeoAnalytics>({
    queryKey: ['/api/analytics/geo'],
    refetchInterval: 60000, // Refresh every minute
  });

  const getThreatLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-800' };
    if (score < 70) return { level: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-800' };
    return { level: 'High', color: 'bg-red-500', textColor: 'text-red-800' };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {riskLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {Math.round(riskData?.threatScore || 0)}%
                </div>
                <Progress 
                  value={riskData?.threatScore || 0} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {getThreatLevel(riskData?.threatScore || 0).level} Risk Level
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk IPs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {riskLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-8 mb-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {riskData?.highRiskIPs.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active threats detected
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Reach</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {geoLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-8 mb-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {geoData?.topCountries.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Countries detected
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Risk IPs */}
      <Card>
        <CardHeader>
          <CardTitle>High Risk IP Addresses</CardTitle>
          <CardDescription>
            IP addresses flagged for suspicious activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : riskData?.highRiskIPs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No high-risk IPs detected</p>
          ) : (
            <div className="space-y-2">
              {riskData?.highRiskIPs.slice(0, 10).map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="font-mono text-sm">{ip}</span>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    High Risk
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity Patterns</CardTitle>
          <CardDescription>
            Automated detection of potentially malicious behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : riskData?.suspiciousPatterns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suspicious patterns detected</p>
          ) : (
            <div className="space-y-3">
              {riskData?.suspiciousPatterns.map((pattern, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {pattern.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        from {pattern.ip} ({pattern.count} events)
                      </span>
                    </div>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity.toUpperCase()}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geographic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Top countries by interaction volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          {geoLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {geoData?.topCountries.slice(0, 10).map((country, index) => {
                const maxCount = geoData.topCountries[0]?.count || 1;
                const percentage = (country.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24">
                      {country.country}
                    </span>
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {country.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}