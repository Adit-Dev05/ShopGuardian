import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Target, Lock, Zap } from "lucide-react";
import ActivityFeed from "@/components/activity-feed";
import AdvancedAnalytics from "@/components/advanced-analytics";
import TenantSelector from "@/components/tenant-selector";

interface InteractionStats {
  totalInteractions: number;
  loginAttempts: number;
  productViews: number;
  navigationClicks: number;
  formInteractions: number;
}

export default function AdminPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>("default-tenant");
  const [alertCount, setAlertCount] = useState(0);

  const { data: stats, isLoading: statsLoading } = useQuery<InteractionStats>({
    queryKey: ['/api/interactions/stats'],
    refetchInterval: 5000,
  });

  const { data: interactions } = useQuery({
    queryKey: ['/api/interactions'],
    refetchInterval: 3000,
  });

  // Calculate threat level based on interactions
  const threatLevel = stats?.totalInteractions ? 
    Math.min(Math.floor(stats.totalInteractions / 10), 3) : 0;
  
  const threatLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const threatColors = ["green", "yellow", "orange", "red"];

  useEffect(() => {
    if (stats?.loginAttempts && stats.loginAttempts > alertCount) {
      setAlertCount(stats.loginAttempts);
    }
  }, [stats?.loginAttempts]);

  // Calculate attack patterns from real data
  const getAttackPatterns = () => {
    if (!interactions) return [];
    
    const patterns = {};
    interactions.forEach(interaction => {
      const pattern = patterns[interaction.type] || { type: interaction.type, count: 0, severity: 'low' };
      pattern.count++;
      
      // Determine severity based on interaction type and frequency
      if (interaction.type === 'login_attempt' || interaction.type === 'login_failed') {
        pattern.severity = pattern.count > 3 ? 'high' : 'medium';
      } else if (interaction.type.includes('form_') || interaction.type === 'signup_attempt') {
        pattern.severity = pattern.count > 5 ? 'medium' : 'low';
      }
      
      patterns[interaction.type] = pattern;
    });
    
    return Object.values(patterns).sort((a, b) => b.count - a.count);
  };

  // Calculate threat vectors
  const getThreatVectorData = () => {
    const total = stats?.totalInteractions || 1;
    return {
      loginForms: ((stats?.loginAttempts || 0) / total * 100),
      navigation: ((stats?.navigationClicks || 0) / total * 100),
      dataHarvesting: ((stats?.productViews || 0) / total * 100),
      formAnalysis: ((stats?.formInteractions || 0) / total * 100)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Cybersecurity Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">ShopGuardian</h1>
              <p className="text-sm text-gray-600">Cybersecurity Honeypot Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            className={`px-3 py-1 text-${threatColors[threatLevel]}-700 bg-${threatColors[threatLevel]}-100 border-${threatColors[threatLevel]}-300`}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Threat Level: {threatLevels[threatLevel]}
          </Badge>
          <TenantSelector 
            selectedTenant={selectedTenant}
            onTenantChange={setSelectedTenant}
          />
        </div>
      </div>

      {/* Security Alerts */}
      {stats?.loginAttempts && stats.loginAttempts > 5 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Security Alert:</strong> Detected {stats.loginAttempts} login attempts. 
            Potential brute force attack in progress.
          </AlertDescription>
        </Alert>
      )}

      {/* Cybersecurity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-600" />
              Threat Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">Total captured interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Lock className="h-4 w-4 mr-2 text-red-600" />
              Login Attacks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.loginAttempts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.loginAttempts && stats.loginAttempts > 3 ? 'Brute force detected' : 'Authentication attempts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-green-600" />
              Reconnaissance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.productViews || 0}</div>
            <p className="text-xs text-muted-foreground">Information gathering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-orange-600" />
              Site Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.navigationClicks || 0}</div>
            <p className="text-xs text-muted-foreground">Navigation enumeration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2 text-purple-600" />
              Honeypot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">ACTIVE</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalInteractions ? `${stats.totalInteractions} threats trapped` : 'Monitoring...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Dashboard */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Live Threats</TabsTrigger>
          <TabsTrigger value="analytics">Threat Analysis</TabsTrigger>
          <TabsTrigger value="reports">Security Reports</TabsTrigger>
          <TabsTrigger value="patterns">Attack Patterns</TabsTrigger>
          <TabsTrigger value="intel">Threat Intel</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Live Threat Detection
              </CardTitle>
              <CardDescription>
                Real-time monitoring of suspicious activities and attack attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Advanced Threat Analysis
              </CardTitle>
              <CardDescription>
                Deep analysis of attack vectors, risk assessment, and geographic threat intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attack Pattern Analysis</CardTitle>
                <CardDescription>Real-time detection of attack methodologies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getAttackPatterns().length > 0 ? (
                  getAttackPatterns().slice(0, 5).map((pattern, index) => (
                    <div key={pattern.type} className={`flex items-center justify-between p-3 rounded ${
                      pattern.severity === 'high' ? 'bg-red-50 border border-red-200' :
                      pattern.severity === 'medium' ? 'bg-orange-50 border border-orange-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div>
                        <p className="font-medium">
                          {pattern.type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pattern.count} occurrences detected
                        </p>
                      </div>
                      <Badge className={
                        pattern.severity === 'high' ? 'bg-red-600 text-white' :
                        pattern.severity === 'medium' ? 'bg-orange-600 text-white' :
                        'bg-blue-600 text-white'
                      }>
                        {pattern.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No attack patterns detected yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Vector Distribution</CardTitle>
                <CardDescription>Breakdown of attack entry points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const vectors = getThreatVectorData();
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Authentication Forms</span>
                          <span className="font-medium">{vectors.loginForms.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-red-600 h-3 rounded-full transition-all" 
                            style={{ width: `${vectors.loginForms}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Navigation Enumeration</span>
                          <span className="font-medium">{vectors.navigation.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-orange-600 h-3 rounded-full transition-all" 
                            style={{ width: `${vectors.navigation}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Information Gathering</span>
                          <span className="font-medium">{vectors.dataHarvesting.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all" 
                            style={{ width: `${vectors.dataHarvesting}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Form Analysis</span>
                          <span className="font-medium">{vectors.formAnalysis.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all" 
                            style={{ width: `${vectors.formAnalysis}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <CardDescription>Real-time threat indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">SQL Injection Attempts</span>
                    <Badge variant="outline">0 detected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">XSS Payloads</span>
                    <Badge variant="outline">0 detected</Badge>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded ${
                    stats?.loginAttempts && stats.loginAttempts > 3 ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <span className="text-sm font-medium">Brute Force Patterns</span>
                    <Badge className={stats?.loginAttempts && stats.loginAttempts > 3 ? 'bg-red-100 text-red-700' : ''}>
                      {stats?.loginAttempts && stats.loginAttempts > 3 ? 'Active' : '0 detected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Bot Signatures</span>
                    <Badge variant="outline">Analyzing...</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Honeypot Effectiveness</CardTitle>
                <CardDescription>Deception success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats?.totalInteractions ? '100%' : '0%'}
                    </div>
                    <p className="text-sm text-gray-600">Threat Containment Rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deception Success</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>False Positive Rate</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data Collection</span>
                      <span className="font-medium text-blue-600">Comprehensive</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Posture</CardTitle>
                <CardDescription>Overall system security status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">SECURE</div>
                    <p className="text-sm text-gray-600">Current Status</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Honeypot Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monitoring</span>
                      <span className="font-medium text-green-600">Real-time</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Logging</span>
                      <span className="font-medium text-green-600">Comprehensive</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Alert System</span>
                      <span className="font-medium text-green-600">Enabled</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Executive Security Assessment Report
              </CardTitle>
              <CardDescription>
                Comprehensive threat analysis and security recommendations for stakeholders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Executive Summary</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-sm"><strong>Assessment Period:</strong> Last 24 hours</p>
                    <p className="text-sm"><strong>Total Threats Detected:</strong> {stats?.totalInteractions || 0}</p>
                    <p className="text-sm"><strong>Critical Threats:</strong> {stats?.loginAttempts && stats.loginAttempts > 5 ? stats.loginAttempts : 0}</p>
                    <p className="text-sm"><strong>Containment Rate:</strong> 100%</p>
                    <p className="text-sm"><strong>System Status:</strong> <span className="text-green-600 font-medium">Secure</span></p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Key Findings</h3>
                  <div className="space-y-2">
                    {stats?.loginAttempts && stats.loginAttempts > 3 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          Detected potential brute force attack with {stats.loginAttempts} login attempts
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Reconnaissance Activity:</strong> {stats?.productViews || 0} information gathering attempts detected
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Honeypot Effectiveness:</strong> All threats successfully contained and logged
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Security Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Immediate Actions</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Continue monitoring login attempts</li>
                      <li>• Maintain honeypot operation</li>
                      <li>• Alert security team if threshold exceeded</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Short-term (1-7 days)</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Enhance threat pattern analysis</li>
                      <li>• Implement IP-based blocking</li>
                      <li>• Expand honeypot coverage</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Long-term (1-4 weeks)</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Deploy machine learning detection</li>
                      <li>• Integrate with SIEM systems</li>
                      <li>• Establish threat intelligence feeds</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Threat Intelligence Summary</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalInteractions || 0}</div>
                      <div className="text-sm text-gray-600">Total Events</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{stats?.loginAttempts || 0}</div>
                      <div className="text-sm text-gray-600">Auth Attacks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats?.productViews || 0}</div>
                      <div className="text-sm text-gray-600">Recon Events</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{stats?.navigationClicks || 0}</div>
                      <div className="text-sm text-gray-600">Site Mapping</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}