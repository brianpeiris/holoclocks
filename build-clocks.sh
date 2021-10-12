for clock in `ls clocks`; do
  pushd clocks/$clock
  rm bundle*
  npm run build
  popd
done
