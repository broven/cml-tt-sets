import BaseCtor from '../../util/proto/BaseCtor'
import lifecycle from '../../util/util/lifecycle'
import VmAdapter from '../core/VmAdapter'
import MiniRuntimeCore from '../../util/proto/MiniRuntimeCore'

export class CmlPage extends BaseCtor {
  constructor (options) {
    super(options)

    this.cmlType = 'tt'

    const runtimeCore = new MiniRuntimeCore({
      polyHooks: lifecycle.get('tt.page.polyHooks'),
      platform: this.cmlType,
      options: this.options
    })

    this.initVmAdapter(VmAdapter, {
      options: this.options,
      type: 'page',
      runtimeMixins: {
        onLoad() {
          // 初始化
          runtimeCore
            .setContext(this)
            .init()
            .start('page-view-render')
        },
        onUnload() {
          // stop
          runtimeCore
            .setContext(this)
            .destory()
        },
        onPullDownRefresh() {
          const path = this.route
          
          this.$cmlEventBus.emit(`${path}_onPullDownRefresh`, {
            path
          })
        },
        onReachBottom() {
          const path = this.route
          
          this.$cmlEventBus.emit(`${path}_onReachBottom`, {
            path
          })
        }
      },
      needResolveAttrs: ['methods'],
      hooks: lifecycle.get('tt.page.hooks'),
      hooksMap: lifecycle.get('tt.page.hooksMap'),
      polyHooks: lifecycle.get('tt.page.polyHooks'),
      usedHooks: lifecycle.get('tt.page.usedHooks')
    })

    Page(this.options)
  }
}
