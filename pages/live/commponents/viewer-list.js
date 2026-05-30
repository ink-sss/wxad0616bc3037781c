var t = require("../../../common/vendor.js"),
  e = {
    components: {
      viewerListItem: function() {
        return "./viewer-list-item.js"
      },
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        keyword: "",
        showSearchClear: !1,
        loading: !1,
        memberCount: 0,
        listData: [],
        no_more: null,
        list_rows: 10,
        page: 1,
        last_page: 1,
        grade_arr: [],
        grade_id: "",
        isExpanded: !1,
        tag_arr: [],
        isTagExpanded: !1,
        nav_height: 50,
        bar_height: 12,
        nav_width: 0,
        jn_width: 0,
        tagIds: [],
        currentRow: {}
      }
    },
    inject: {
      assistant: {
        default: 0
      }
    },
    watch: {
      keyword: function(t, e) {
        this.showSearchClear = "" != t
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
      },
      displayedGrades: function() {
        return this.isExpanded ? this.grade_arr : this.grade_arr.slice(0, 7)
      },
      displayedTags: function() {
        return this.isTagExpanded ? this.tag_arr : this.tag_arr.slice(0, 7)
      }
    },
    props: {
      roomId: {
        type: [String, Number],
        default: ""
      }
    },
    mounted: function() {
      var t = this.getNavHeight();
      this.nav_height = t.navHeight > 0 ? t.navHeight : this.nav_height, this.bar_height = t.statusBarHeight > 0 ? t.statusBarHeight : this.bar_height, this.nav_width = t.navWidth, this.jn_width = t.jnWidth
    },
    created: function() {},
    methods: {
      ellipsis: function(t) {
        return t ? t.length > 4 ? t.slice(0, 4) + "..." : t : ""
      },
      toggleExpand: function() {
        this.isExpanded = !this.isExpanded
      },
      selectGrade: function(t) {
        this.grade_id = t.grade_id
      },
      selectTag: function(t) {
        var e = this.tagIds.indexOf(t.tag_id); - 1 === e ? this.tagIds.push(t.tag_id) : this.tagIds.splice(e, 1)
      },
      TagExpand: function() {
        this.isTagExpanded = !this.isTagExpanded
      },
      showPop: function() {
        this.search(), this.$refs.viewerPup.open()
      },
      search: function() {
        this.page = 1, this.listData = [], this.getList()
      },
      getList: function() {
        var e = this;
        this.loading = !0, t.index.showLoading({
          title: "加载中"
        }), this._post("live.roomNew/getLiveMembersList", {
          keyword: this.keyword,
          room_id: this.roomId,
          page: this.page,
          list_rows: this.list_rows,
          grade_id: this.grade_id,
          tag_ids: this.tagIds,
          userRole: this.assistant
        }, (function(a) {
          e.memberCount = a.data.total, e.listData = e.listData.concat(a.data.data), e.grade_arr = a.data.grades, e.grade_arr.unshift({
            grade_id: "",
            name: "全部"
          }), e.tag_arr = a.data.tags, e.last_page = a.data.last_page, a.data.last_page <= 1 && (e.no_more = !0), e.loading = !1, t.index.hideLoading()
        }))
      },
      clearKeyword: function() {
        this.keyword = ""
      },
      scrolltolowerFunc: function() {
        if (this.page++, this.loading = !0, this.page > this.last_page) return this.loading = !1, void(this.no_more = !0);
        this.getList()
      },
      tagClick: function() {
        this.$refs.tag_box.open()
      },
      tagSub: function() {
        this.search(), this.$refs.tag_box.close()
      },
      tagCancel: function() {
        this.$refs.tag_box.close(), this.grade_id = "", this.tagIds = []
      },
      resetClick: function() {
        this.grade_id = "", this.tagIds = [], this.keyword = "", this.search()
      },
      setTags: function(t) {
        this.currentRow = JSON.parse(JSON.stringify(t)), this.$refs.setTagPop.open()
      },
      setUserTag: function(t) {
        var e = this.currentRow.user_tag_ids.indexOf(t.tag_id);
        e > -1 ? this.currentRow.user_tag_ids.splice(e, 1) : this.currentRow.user_tag_ids.push(t.tag_id)
      },
      saveUserTag: function() {
        var e = this;
        this._post("live.roomNew/setUserTag", {
          user_id: this.currentRow.user_id,
          tag_ids: this.currentRow.user_tag_ids.join(",")
        }, (function(a) {
          if (1 == a.code) {
            t.index.showToast({
              title: a.msg
            }), e.$refs.setTagPop.close();
            for (var i = [], r = 0; r < e.tag_arr.length; r++) e.currentRow.user_tag_ids.includes(e.tag_arr[r].tag_id) && i.push(e.tag_arr[r].tag_name);
            for (var s = 0; s < e.listData.length; s++)
              if (e.listData[s].user_id == e.currentRow.user_id) {
                e.listData[s].user_tags = i, e.listData[s].user_tag_ids = e.currentRow.user_tag_ids;
                break
              } e.currentRow = {}
          }
        }))
      },
      closeUserTag: function() {
        this.$refs.setTagPop.close(), this.currentRow = {}
      }
    }
  };
Array || (t.resolveComponent("uni-icons") + t.resolveComponent("viewer-list-item") + t.resolveComponent("uni-load-more") + t.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var a = t._export_sfc(e, [
  ["render", function(e, a, i, r, s, n) {
    return t.e({
      a: e.config.pic_url + "/20251112141857587224741.png",
      b: t.o((function() {
        return n.search && n.search.apply(n, arguments)
      }), "33"),
      c: s.keyword,
      d: t.o((function(t) {
        return s.keyword = t.detail.value
      }), "3c"),
      e: s.showSearchClear
    }, s.showSearchClear ? {
      f: t.o(n.clearKeyword, "90"),
      g: t.p({
        type: "clear",
        size: "22"
      })
    } : {}, {
      h: e.config.pic_url + "/20260310150414785e06610.png",
      i: t.o((function() {
        return n.tagClick && n.tagClick.apply(n, arguments)
      }), "aa"),
      j: t.o((function() {
        return n.resetClick && n.resetClick.apply(n, arguments)
      }), "a5"),
      k: t.t(s.memberCount),
      l: t.f(s.listData, (function(e, a, i) {
        return {
          a: t.o(n.setTags, e.id),
          b: t.o(n.search, e.id),
          c: "aeb455d0-2-" + i + ",aeb455d0-0",
          d: t.p({
            item: e
          }),
          e: e.id
        }
      })),
      m: 0 == s.listData.length && !s.loading
    }, 0 != s.listData.length || s.loading ? {
      n: t.p({
        loadingType: n.loadingType
      })
    } : {}, {
      o: t.o((function() {
        return n.scrolltolowerFunc && n.scrolltolowerFunc.apply(n, arguments)
      }), "66"),
      p: t.sr("viewerPup", "aeb455d0-0"),
      q: t.p({
        type: "bottom",
        "safe-area": !1
      }),
      r: t.f(n.displayedGrades, (function(e, a, i) {
        return {
          a: t.t(n.ellipsis(e.name)),
          b: e.grade_id,
          c: s.grade_id === e.grade_id ? 1 : "",
          d: t.o((function(t) {
            return n.selectGrade(e)
          }), e.grade_id)
        }
      })),
      s: s.grade_arr.length > 7
    }, s.grade_arr.length > 7 ? {
      t: t.t(s.isExpanded ? "收起" : "展开"),
      v: t.n(s.isExpanded ? "fold" : ""),
      w: e.config.pic_url + "/20260310150656fd16a4112.png",
      x: t.o((function() {
        return n.toggleExpand && n.toggleExpand.apply(n, arguments)
      }), "72")
    } : {}, {
      y: t.f(n.displayedTags, (function(e, a, i) {
        return {
          a: t.t(n.ellipsis(e.tag_name)),
          b: e.tag_id,
          c: s.tagIds.includes(e.tag_id) ? 1 : "",
          d: t.o((function(t) {
            return n.selectTag(e)
          }), e.tag_id)
        }
      })),
      z: s.tag_arr.length > 7
    }, s.tag_arr.length > 7 ? {
      A: t.t(s.isTagExpanded ? "收起" : "展开"),
      B: t.o((function() {
        return n.TagExpand && n.TagExpand.apply(n, arguments)
      }), "2d")
    } : {}, {
      C: t.s("margin-top:" + (s.bar_height + 10) + "px;"),
      D: t.o((function() {
        return n.tagCancel && n.tagCancel.apply(n, arguments)
      }), "f7"),
      E: t.o((function() {
        return n.tagSub && n.tagSub.apply(n, arguments)
      }), "cc"),
      F: t.sr("tag_box", "aeb455d0-4"),
      G: t.p({
        type: "top",
        "safe-area": !1
      }),
      H: s.currentRow.user_id
    }, s.currentRow.user_id ? {
      I: t.o(n.closeUserTag, "cd"),
      J: t.p({
        type: "closeempty",
        size: "24"
      }),
      K: t.f(s.tag_arr, (function(e, a, i) {
        return t.e({
          a: t.t(e.tag_name),
          b: s.currentRow.user_tag_ids.includes(e.tag_id)
        }, s.currentRow.user_tag_ids.includes(e.tag_id) ? {
          c: "aeb455d0-7-" + i + ",aeb455d0-5",
          d: t.p({
            type: "checkbox-filled",
            color: "#ffffff",
            size: "15"
          })
        } : {}, {
          e: t.o((function(t) {
            return n.setUserTag(e)
          }), e.tag_id),
          f: e.tag_id,
          g: t.n(s.currentRow.user_tag_ids.includes(e.tag_id) ? "tag-item-act" : "")
        })
      })),
      L: t.o((function() {
        return n.saveUserTag && n.saveUserTag.apply(n, arguments)
      }), "eb")
    } : {}, {
      M: t.sr("setTagPop", "aeb455d0-5"),
      N: t.o(n.closeUserTag, "6b"),
      O: t.p({
        type: "center"
      })
    })
  }],
  ["__scopeId", "data-v-aeb455d0"]
]);
wx.createComponent(a);