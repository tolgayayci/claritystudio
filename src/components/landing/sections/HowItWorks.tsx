import { ArrowRight, Github, Mail, FileText, FolderOpen, Code, Rocket, Wallet, MousePointer, Terminal, Zap, Globe, FolderTree, Layers, Server, Package, GitBranch } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-orange-600 uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            From idea to deployed contract in minutes
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Four simple steps. No installation. No configuration. Just results.
          </p>
        </div>

        {/* Step 1: Write */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl font-bold text-gray-100">1</div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                Write
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Write Clarity contracts in the browser with syntax highlighting and autocomplete.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Start fresh</div>
                    <div className="text-gray-600">Create a new Clarity contract from scratch</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Code className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Use templates</div>
                    <div className="text-gray-600">Start with SIP-010 token, SIP-009 NFT, or custom templates</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FolderTree className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Manage Multiple Projects</div>
                    <div className="text-gray-600">Many projects, many contracts as you wish</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-start">
              <div className="w-11/12 lg:w-10/12 rounded-lg overflow-hidden shadow-2xl bg-gray-100 p-8">
                <div className="bg-white rounded-lg p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Login form */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-800">Email address</div>
                      <div className="h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center px-3">
                        <span className="text-gray-500 text-sm">your@email.com</span>
                      </div>
                      <div className="h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Get started</span>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-700">Counter</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Code className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">SIP-010 Token</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Package className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-700">SIP-009 NFT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Validate */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-lg overflow-hidden shadow-2xl bg-gray-100 p-8">
                <div className="bg-white rounded-lg p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Code editor mockup */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-purple-200 rounded w-24" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-blue-200 rounded w-24" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-blue-200 rounded w-16" />
                        <div className="h-3 bg-yellow-200 rounded w-20" />
                        <div className="h-3 bg-gray-200 rounded w-4" />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-12" />
                        <div className="h-3 bg-blue-200 rounded w-8" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-blue-200 rounded w-8" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-4" />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-green-200 rounded w-14" />
                        <div className="h-3 bg-gray-200 rounded w-6" />
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-orange-200 rounded w-10" />
                        <div className="h-3 bg-gray-200 rounded w-8" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-4" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Validate Contract</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl font-bold text-gray-100">2</div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                Validate
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Check syntax and semantics instantly with one click.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FolderOpen className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Monaco Editor</div>
                    <div className="text-gray-600">Professional code editor with Clarity support</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Terminal className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Instant Validation</div>
                    <div className="text-gray-600">Check syntax and semantics with one click</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wallet className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Built-in Wallet</div>
                    <div className="text-gray-600">Pre-funded STX testnet account</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Deploy */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl font-bold text-gray-100">3</div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                Deploy
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Deploy to Stacks testnet with your built-in pre-funded STX wallet.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Rocket className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">One-Click Deploy</div>
                    <div className="text-gray-600">Deploy to Stacks testnet instantly</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Transaction Monitoring</div>
                    <div className="text-gray-600">Real-time deployment status and tx tracking</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Bitcoin Secured</div>
                    <div className="text-gray-600">Contracts anchored to Bitcoin via Proof of Transfer</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-2xl bg-gray-100 p-8">
                <div className="bg-white rounded-lg p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Deployment success */}
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-sm text-orange-700 font-medium">Contract deployed successfully</span>
                      </div>
                    </div>

                    {/* Contract info */}
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium">Deployment Details</div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">Contract</span>
                          <span className="text-xs font-mono text-orange-600">ST1...counter</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">Network</span>
                          <span className="text-xs text-gray-600">Stacks Testnet</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">Status</span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-green-600">Confirmed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Interact */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-lg overflow-hidden shadow-2xl bg-gray-100 p-8">
                <div className="bg-white rounded-lg p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Contract interaction */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 font-medium">Contract Functions</div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">increment</span>
                          <div className="w-16 h-6 bg-blue-500 rounded text-xs text-white flex items-center justify-center">Call</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">get-count</span>
                          <div className="w-16 h-6 bg-green-500 rounded text-xs text-white flex items-center justify-center">Read</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">reset</span>
                          <div className="w-16 h-6 bg-orange-500 rounded text-xs text-white flex items-center justify-center">Call</div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction result */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-green-700 font-medium">Transaction successful</span>
                        </div>
                        <div className="text-xs text-green-600">Result: (ok u42)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl font-bold text-gray-100">4</div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                Interact
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Call your contract's functions through the auto-generated interface.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MousePointer className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Visual Interface</div>
                    <div className="text-gray-600">Click to call functions, see results instantly</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Transaction History</div>
                    <div className="text-gray-600">Monitor all contract calls and events</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Terminal className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Console Output</div>
                    <div className="text-gray-600">See validation logs and errors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="border-t border-gray-100 pt-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything you need, built-in
            </h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Professional tools that work instantly, no setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Stacks Testnet Deploy</h4>
              <p className="text-gray-600 leading-relaxed">
                Deploy to Stacks testnet<br />
                with built-in wallet
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Contract Templates</h4>
              <p className="text-gray-600 leading-relaxed">
                SIP-010, SIP-009, and more<br />
                ready-to-use templates
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Clarity Language</h4>
              <p className="text-gray-600 leading-relaxed">
                Decidable, interpreted on-chain<br />
                safe by design
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Terminal className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Validation</h4>
              <p className="text-gray-600 leading-relaxed">
                Check syntax and semantics<br />
                with one click
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MousePointer className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Auto-Generated UI</h4>
              <p className="text-gray-600 leading-relaxed">
                Interact with deployed contracts<br />
                through generated interface
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Project Sharing</h4>
              <p className="text-gray-600 leading-relaxed">
                Share contract projects<br />
                with permalink URLs
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 pt-20 border-t border-gray-100">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Ready to build something amazing on Stacks?
            </h3>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const trigger = document.querySelector<HTMLButtonElement>('[data-signin-trigger]');
                  if (trigger) trigger.click();
                }}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-900 transition-colors group"
              >
                Get started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                View docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
