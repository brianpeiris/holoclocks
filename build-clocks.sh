for clock in `ls clocks`; do
  pushd clocks/$clock
  npm run build
  popd
done
