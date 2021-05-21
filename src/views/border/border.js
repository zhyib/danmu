import Home from '@/views/home/index.vue';

const { ipcRenderer } = global.electron;

export default {
  name: 'border',
  components: {
    Home,
  },
  data() {
    return {};
  },
  methods: {
    minimize() {
      ipcRenderer.send('window-min');
    },
    close() {
      ipcRenderer.send('window-close');
    },
  },
};
